package com.ticketing.genai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class VoyageEmbeddingService {

    public static final int EMBEDDING_DIM = 1024;
    private static final String VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";

    @Value("${genai.voyage.api-key:stub}")
    private String apiKey;

    @Value("${genai.voyage.model:voyage-3.5}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Generate embedding for a single text input.
     * @param text Input text string
     * @param inputType "document" for ingestion, "query" for retrieval
     */
    public float[] getEmbedding(String text, String inputType) {
        List<float[]> embeddings = getEmbeddings(List.of(text), inputType);
        return embeddings.isEmpty() ? generateStubEmbedding(text) : embeddings.get(0);
    }

    /**
     * Generate embeddings for a batch of texts.
     * @param texts List of input strings
     * @param inputType "document" or "query"
     */
    public List<float[]> getEmbeddings(List<String> texts, String inputType) {
        if (texts == null || texts.isEmpty()) {
            return List.of();
        }

        if ("stub".equalsIgnoreCase(apiKey) || apiKey == null || apiKey.trim().isEmpty()) {
            log.info("Voyage API key set to 'stub'. Using deterministic local 1024-dim embedding generator.");
            return texts.stream().map(this::generateStubEmbedding).toList();
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey.trim());

            Map<String, Object> body = new HashMap<>();
            body.put("model", modelName);
            body.put("input", texts);
            body.put("input_type", inputType);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(VOYAGE_API_URL, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
                List<float[]> result = new ArrayList<>();
                for (Map<String, Object> item : data) {
                    List<Number> embList = (List<Number>) item.get("embedding");
                    float[] emb = new float[embList.size()];
                    for (int i = 0; i < embList.size(); i++) {
                        emb[i] = embList.get(i).floatValue();
                    }
                    result.add(emb);
                }
                return result;
            }
        } catch (Exception e) {
            log.warn("Voyage AI API call failed ({}), falling back to deterministic local embeddings.", e.getMessage());
        }

        return texts.stream().map(this::generateStubEmbedding).toList();
    }

    /**
     * Generates a normalized 1024-dimensional float embedding deterministically using SHA-256 hash
     * and character n-gram distribution of the input text.
     */
    public float[] generateStubEmbedding(String text) {
        float[] vector = new float[EMBEDDING_DIM];
        if (text == null) text = "";
        
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.toLowerCase().getBytes(StandardCharsets.UTF_8));
            
            for (int i = 0; i < EMBEDDING_DIM; i++) {
                int byteVal = hash[i % hash.length] & 0xFF;
                vector[i] = (float) Math.sin(byteVal * 0.1 + (i * 0.05));
            }
            
            // Add term frequencies into vector features to preserve semantic similarity in stub mode
            String[] words = text.toLowerCase().split("\\W+");
            for (String word : words) {
                if (word.isEmpty()) continue;
                int hashIdx = Math.abs(word.hashCode()) % EMBEDDING_DIM;
                vector[hashIdx] += 0.5f;
            }

            // Normalize vector to unit length
            double norm = 0.0;
            for (float v : vector) {
                norm += v * v;
            }
            norm = Math.sqrt(norm);
            if (norm > 0) {
                for (int i = 0; i < EMBEDDING_DIM; i++) {
                    vector[i] /= norm;
                }
            }
        } catch (Exception e) {
            log.error("Error generating stub vector", e);
        }
        return vector;
    }
}
