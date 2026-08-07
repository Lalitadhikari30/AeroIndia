package com.ticketing.genai.service;

import com.ticketing.genai.dto.SupportQueryRequest;
import com.ticketing.genai.dto.SupportQueryResponse;
import com.ticketing.genai.model.FaqEmbedding;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RAGSupportChatService {

    private final RetrievalService retrievalService;
    private final GenerationService generationService;

    public SupportQueryResponse processSupportQuery(SupportQueryRequest request) {
        String convId = request.getConversationId();
        if (convId == null || convId.trim().isEmpty()) {
            convId = UUID.randomUUID().toString();
        }

        String userQuery = request.getQuery();
        log.info("Processing RAG passenger support query: '{}' (convId: {})", userQuery, convId);

        // 1. Retrieve top-K relevant FAQ chunks (pgvector / similarity search unchanged)
        List<RetrievalService.ScoredFaq> matches = retrievalService.retrieveRelevantFaqs(userQuery);

        if (matches.isEmpty()) {
            log.info("No matching AAI FAQ entries found for query above threshold.");
            return SupportQueryResponse.builder()
                    .answer("I couldn't find specific information regarding your request in the official AAI FAQs. " +
                            "For further assistance, please contact the Airports Authority of India (AAI) Helpline at " +
                            "Toll-Free 1800-11-0402 or Corporate Headquarters at 011-24632950.")
                    .sources(List.of("AAI Official Support Helpline"))
                    .confidenceScore(0.0)
                    .conversationId(convId)
                    .build();
        }

        // 2. Build Grounded Context & Citation Sources
        StringBuilder contextBuilder = new StringBuilder();
        List<String> sources = new ArrayList<>();
        double topScore = matches.get(0).getScore();

        for (int i = 0; i < matches.size(); i++) {
            FaqEmbedding faq = matches.get(i).getFaq();
            String sourceTag = String.format("Source: AAI %s FAQs - %s", faq.getCategory(), faq.getTitle());
            if (!sources.contains(sourceTag)) {
                sources.add(sourceTag);
            }

            contextBuilder.append(String.format("[%d] Title: %s\nCategory: %s (%s)\nDetails: %s\nSource URL: %s\n\n",
                    i + 1, faq.getTitle(), faq.getCategory(), faq.getSubcategory(), faq.getContent(), faq.getSourceUrl()));
        }

        // 3. Fallback raw text representation
        StringBuilder fallbackBuilder = new StringBuilder();
        fallbackBuilder.append("Based on official Airports Authority of India (AAI) guidelines:\n\n");
        for (RetrievalService.ScoredFaq scoredFaq : matches) {
            FaqEmbedding faq = scoredFaq.getFaq();
            fallbackBuilder.append("• **").append(faq.getTitle()).append("** (").append(faq.getCategory());
            if (faq.getSubcategory() != null && !faq.getSubcategory().isEmpty()) {
                fallbackBuilder.append(" - ").append(faq.getSubcategory());
            }
            fallbackBuilder.append("):\n  ").append(faq.getContent()).append("\n\n");
        }
        fallbackBuilder.append("For further official assistance or escalations, you may visit ").append(matches.get(0).getFaq().getSourceUrl());
        String fallbackAnswer = fallbackBuilder.toString().trim();

        // 4. Generation Step: Prompt Gemini model with retrieved context
        String prompt = String.format("""
                You are AeroIndia's official flight assistant. Answer the passenger's question using ONLY the context provided below.
                If the context doesn't contain the answer, politely state that you don't have that specific information.
                Provide a clear, natural, and helpful response.

                Context:
                %s

                Question:
                %s
                """, contextBuilder.toString().trim(), userQuery);

        String finalAnswer;
        try {
            String generatedAnswer = generationService.generate(prompt);
            if (generatedAnswer != null && !generatedAnswer.trim().isEmpty()) {
                finalAnswer = generatedAnswer.trim();
                log.info("Successfully generated natural response via Gemini for query: '{}'", userQuery);
            } else {
                log.warn("Gemini generation returned empty/null answer. Falling back to raw retrieved chunks.");
                finalAnswer = fallbackAnswer;
            }
        } catch (Exception e) {
            log.error("Gemini generation failed: {}. Falling back to raw retrieved chunks.", e.getMessage());
            finalAnswer = fallbackAnswer;
        }

        return SupportQueryResponse.builder()
                .answer(finalAnswer)
                .sources(sources)
                .confidenceScore(Math.round(topScore * 100.0) / 100.0)
                .conversationId(convId)
                .build();
    }
}
