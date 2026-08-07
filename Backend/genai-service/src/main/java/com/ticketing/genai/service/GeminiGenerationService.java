package com.ticketing.genai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
public class GeminiGenerationService implements GenerationService {

    @Value("${gemini.api.key:${GEMINI_API_KEY:}}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-2.0-flash}")
    private String primaryModel;

    private final RestTemplate restTemplate;

    public GeminiGenerationService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(8000);
        factory.setReadTimeout(12000);
        this.restTemplate = new RestTemplate(factory);
    }

    @Override
    public String generate(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty() || "stub".equalsIgnoreCase(apiKey.trim())) {
            log.warn("Gemini API key is missing or not configured. Skipping Gemini generation.");
            return null;
        }

        if (prompt == null || prompt.trim().isEmpty()) {
            return null;
        }

        Set<String> modelsToTry = new LinkedHashSet<>();
        if (primaryModel != null && !primaryModel.isBlank()) {
            modelsToTry.add(primaryModel.trim());
        }
        modelsToTry.add("gemini-flash-latest");
        modelsToTry.add("gemini-2.5-flash");
        modelsToTry.add("gemini-2.0-flash");
        modelsToTry.add("gemini-2.0-flash-lite");
        modelsToTry.add("gemini-pro-latest");

        for (String modelName : modelsToTry) {
            String result = callGeminiWithRetry(modelName, prompt);
            if (result != null && !result.trim().isEmpty()) {
                return result;
            }
        }

        log.error("Failed to generate response from Gemini using any model candidate.");
        return null;
    }

    private String callGeminiWithRetry(String modelName, String prompt) {
        // Try up to 2 times for rate limit (429) backoff
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                String result = callGeminiApi(modelName, prompt);
                if (result != null) {
                    return result;
                }
            } catch (HttpStatusCodeException e) {
                if (e.getStatusCode().value() == 429 && attempt == 1) {
                    log.warn("Rate limit (429) encountered for model {}. Retrying in 1.5s...", modelName);
                    try {
                        Thread.sleep(1500);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                } else {
                    log.error("Error invoking Gemini API with model {}: {} - {}", modelName, e.getStatusCode(), e.getResponseBodyAsString());
                    break;
                }
            } catch (Exception e) {
                log.error("Unexpected error invoking Gemini API with model {}: {}", modelName, e.getMessage());
                break;
            }
        }
        return null;
    }

    private String callGeminiApi(String modelName, String prompt) {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                modelName, apiKey.trim());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of("contents", List.of(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        log.info("Calling Gemini REST API with model: {}", modelName);
        Map response = restTemplate.postForObject(url, entity, Map.class);

        if (response != null && response.containsKey("candidates")) {
            List candidates = (List) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map candidate = (Map) candidates.get(0);
                Map contentObj = (Map) candidate.get("content");
                if (contentObj != null && contentObj.containsKey("parts")) {
                    List parts = (List) contentObj.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        Map partObj = (Map) parts.get(0);
                        String generatedText = (String) partObj.get("text");
                        if (generatedText != null && !generatedText.trim().isEmpty()) {
                            log.info("✅ Successfully received generated content from Gemini REST API ({})", modelName);
                            return generatedText.trim();
                        }
                    }
                }
            }
        }
        return null;
    }
}
