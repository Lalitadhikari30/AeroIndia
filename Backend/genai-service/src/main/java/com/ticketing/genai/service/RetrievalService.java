package com.ticketing.genai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.genai.model.FaqEmbedding;
import com.ticketing.genai.repository.FaqEmbeddingRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RetrievalService {

    private final FaqEmbeddingRepository repository;
    private final VoyageEmbeddingService embeddingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${genai.rag.top-k:4}")
    private int topK;

    @Value("${genai.rag.similarity-threshold:0.45}")
    private double similarityThreshold;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoredFaq {
        private FaqEmbedding faq;
        private double score;
    }

    /**
     * Retrieve top-k nearest matching FAQ entries for a given query string.
     */
    public List<ScoredFaq> retrieveRelevantFaqs(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        // 1. Generate query embedding (input_type = "query")
        float[] queryVector = embeddingService.getEmbedding(query, "query");

        // 2. Fetch stored FAQ embeddings
        List<FaqEmbedding> allFaqs = repository.findAll();
        if (allFaqs.isEmpty()) {
            log.warn("No FAQ embeddings found in database during retrieval.");
            return List.of();
        }

        // 3. Compute Cosine Similarity (Dot Product of normalized vectors)
        List<ScoredFaq> scoredList = new ArrayList<>();
        for (FaqEmbedding faq : allFaqs) {
            float[] docVector = parseVectorJson(faq.getEmbeddingJson());
            if (docVector == null || docVector.length != queryVector.length) {
                // Generate on the fly if missing
                docVector = embeddingService.generateStubEmbedding(faq.getTitle() + " " + faq.getContent());
            }

            double sim = calculateCosineSimilarity(queryVector, docVector);

            // Additional text keyword matching boost for exact topic matches
            String textLower = (faq.getTitle() + " " + faq.getContent() + " " + faq.getCategory()).toLowerCase();
            String[] queryTerms = query.toLowerCase().split("\\W+");
            int matches = 0;
            for (String term : queryTerms) {
                if (term.length() > 2 && textLower.contains(term)) {
                    matches++;
                }
            }
            if (queryTerms.length > 0) {
                double keywordBoost = 0.25 * ((double) matches / queryTerms.length);
                sim = Math.min(1.0, sim + keywordBoost);
            }

            if (sim >= similarityThreshold) {
                scoredList.add(ScoredFaq.builder().faq(faq).score(sim).build());
            }
        }

        // 4. Sort descending by score and pick top-K
        scoredList.sort(Comparator.comparingDouble(ScoredFaq::getScore).reversed());
        return scoredList.stream().limit(topK).toList();
    }

    private double calculateCosineSimilarity(float[] vecA, float[] vecB) {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private float[] parseVectorJson(String json) {
        if (json == null || json.isEmpty()) return null;
        try {
            float[] arr = objectMapper.readValue(json, float[].class);
            return arr;
        } catch (Exception e) {
            return null;
        }
    }
}
