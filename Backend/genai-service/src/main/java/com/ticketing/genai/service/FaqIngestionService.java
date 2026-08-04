package com.ticketing.genai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.genai.model.FaqEmbedding;
import com.ticketing.genai.repository.FaqEmbeddingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FaqIngestionService implements CommandLineRunner {

    private final FaqEmbeddingRepository repository;
    private final VoyageEmbeddingService embeddingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void run(String... args) throws Exception {
        ingestFaqsFromJsonl();
    }

    public int ingestFaqsFromJsonl() {
        log.info("Starting AAI FAQ ingestion pipeline from aai_faqs_rag.jsonl...");
        int count = 0;
        try {
            ClassPathResource resource = new ClassPathResource("data/aai_faqs_rag.jsonl");
            if (!resource.exists()) {
                log.warn("aai_faqs_rag.jsonl resource file not found on classpath!");
                return 0;
            }

            List<JsonNode> records = new ArrayList<>();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.trim().isEmpty()) continue;
                    try {
                        JsonNode node = objectMapper.readTree(line);
                        records.add(node);
                    } catch (Exception e) {
                        log.error("Skipping malformed JSON line: {}", line, e);
                    }
                }
            }

            log.info("Loaded {} FAQ records from JSONL. Generating embeddings...", records.size());

            // Process in batches of 5
            int batchSize = 5;
            for (int i = 0; i < records.size(); i += batchSize) {
                List<JsonNode> batch = records.subList(i, Math.min(i + batchSize, records.size()));
                List<String> textsToEmbed = batch.stream()
                        .map(node -> node.get("title").asText() + " " + node.get("text").asText())
                        .toList();

                List<float[]> embeddings = embeddingService.getEmbeddings(textsToEmbed, "document");

                List<FaqEmbedding> entitiesToSave = new ArrayList<>();
                for (int j = 0; j < batch.size(); j++) {
                    JsonNode node = batch.get(j);
                    String id = node.get("id").asText();
                    
                    float[] vec = embeddings.get(j);
                    String vecJson = Arrays.toString(vec);

                    FaqEmbedding entity = FaqEmbedding.builder()
                            .id(id)
                            .category(node.get("category").asText())
                            .subcategory(node.has("subcategory") ? node.get("subcategory").asText() : "")
                            .title(node.get("title").asText())
                            .content(node.get("text").asText())
                            .sourceUrl(node.has("source_url") ? node.get("source_url").asText() : "https://www.aai.aero/en/faqs")
                            .embeddingJson(vecJson)
                            .build();

                    entitiesToSave.add(entity);
                }

                repository.saveAll(entitiesToSave);
                count += entitiesToSave.size();
                log.info("Ingested {}/{} FAQ embeddings into database.", count, records.size());
            }

            log.info("✅ Successfully completed AAI FAQ ingestion. Total records: {}", count);
        } catch (Exception e) {
            log.error("Failed to execute FAQ ingestion pipeline", e);
        }
        return count;
    }
}
