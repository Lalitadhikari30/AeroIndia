package com.ticketing.genai.service;

import com.ticketing.genai.dto.ChatRequest;
import com.ticketing.genai.dto.ChatResponse;
import com.ticketing.genai.model.PolicyDocument;
import com.ticketing.genai.repository.PolicyDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final PolicyDocumentRepository documentRepository;
    private final Map<String, List<String>> conversationHistory = new ConcurrentHashMap<>();

    public ChatResponse chat(ChatRequest request) {
        String convId = request.getConversationId();
        if (convId == null || convId.isEmpty()) {
            convId = UUID.randomUUID().toString();
        }
        
        conversationHistory.putIfAbsent(convId, new ArrayList<>());
        conversationHistory.get(convId).add("User: " + request.getMessage());
        
        String lowerMessage = request.getMessage().toLowerCase();
        List<PolicyDocument> docs = new ArrayList<>();
        
        if (lowerMessage.contains("baggage") || lowerMessage.contains("luggage") || lowerMessage.contains("bag")) {
            docs.addAll(documentRepository.findByCategory("baggage-policy"));
        } else if (lowerMessage.contains("refund") || lowerMessage.contains("cancel")) {
            docs.addAll(documentRepository.findByCategory("refund-policy"));
        } else if (lowerMessage.contains("seat")) {
            docs.addAll(documentRepository.findByCategory("seat-policy"));
        } else if (lowerMessage.contains("lounge")) {
            docs.addAll(documentRepository.findByCategory("lounge-policy"));
        } else if (lowerMessage.contains("delay") || lowerMessage.contains("compensation")) {
            docs.addAll(documentRepository.findByCategory("delay-policy"));
        }
        
        String responseText;
        List<String> sources = new ArrayList<>();
        
        if (!docs.isEmpty()) {
            PolicyDocument doc = docs.get(0);
            responseText = "Based on our policies: " + doc.getContent();
            sources.add(doc.getTitle());
        } else {
            responseText = "I can help with flight bookings, baggage policies, refund policies, and more. Please be more specific.";
        }
        
        conversationHistory.get(convId).add("AI: " + responseText);
        
        return ChatResponse.builder()
                .response(responseText)
                .sources(sources)
                .conversationId(convId)
                .build();
    }
}
