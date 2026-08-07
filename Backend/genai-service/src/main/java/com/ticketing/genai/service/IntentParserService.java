package com.ticketing.genai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.genai.dto.ParsedIntent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class IntentParserService {

    private final GenerationService generationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Map<String, String> CITY_TO_CODE = new HashMap<>();
    static {
        CITY_TO_CODE.put("delhi", "DEL");
        CITY_TO_CODE.put("mumbai", "BOM");
        CITY_TO_CODE.put("bangalore", "BLR");
        CITY_TO_CODE.put("chennai", "MAA");
        CITY_TO_CODE.put("kolkata", "CCU");
        CITY_TO_CODE.put("hyderabad", "HYD");
        CITY_TO_CODE.put("goa", "GOI");
        CITY_TO_CODE.put("kochi", "COK");
        CITY_TO_CODE.put("ahmedabad", "AMD");
        CITY_TO_CODE.put("jaipur", "JAI");
    }

    public ParsedIntent parseIntent(String naturalLanguageQuery) {
        if (naturalLanguageQuery == null || naturalLanguageQuery.trim().isEmpty()) {
            return parseIntentRuleBased(naturalLanguageQuery);
        }

        // Prompt Gemini to extract structured parameters
        String prompt = String.format("""
                You are an intent parser for an Indian airline reservation system (AeroIndia).
                Extract flight search parameters from the user's natural language query into a JSON object.

                JSON Fields:
                - departureAirport: 3-letter IATA code (DEL, BOM, BLR, MAA, CCU, HYD, GOI, COK, AMD, JAI). Default null if unspecified.
                - arrivalAirport: 3-letter IATA code. Default null if unspecified.
                - date: YYYY-MM-DD format (use "2026-08-01" as default reference date if user says next week/tomorrow/etc, or null if unspecified).
                - timePreference: "morning", "afternoon", "evening", or "night" (or null).
                - sortBy: "price", "duration", or "departureTime" (or null).

                Return ONLY raw valid JSON (no markdown formatting, no code block backticks ```, no extra words).

                User query: %s
                """, naturalLanguageQuery);

        try {
            String jsonOutput = generationService.generate(prompt);
            if (jsonOutput != null && !jsonOutput.isBlank()) {
                // Clean markdown code fence formatting if model includes ```json ... ```
                jsonOutput = jsonOutput.replaceAll("```json", "").replaceAll("```", "").trim();
                ParsedIntent parsed = objectMapper.readValue(jsonOutput, ParsedIntent.class);
                if (parsed != null && (parsed.getDepartureAirport() != null || parsed.getArrivalAirport() != null)) {
                    log.info("Gemini parsed intent successfully: {}", jsonOutput);
                    if (parsed.getDate() == null || parsed.getDate().isBlank()) {
                        parsed.setDate("2026-08-01");
                    }
                    return parsed;
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse intent via Gemini API: {}. Falling back to rule-based parser.", e.getMessage());
        }

        return parseIntentRuleBased(naturalLanguageQuery);
    }

    private ParsedIntent parseIntentRuleBased(String naturalLanguageQuery) {
        String lowerQuery = naturalLanguageQuery != null ? naturalLanguageQuery.toLowerCase() : "";
        ParsedIntent intent = new ParsedIntent();

        for (Map.Entry<String, String> entry : CITY_TO_CODE.entrySet()) {
            if (lowerQuery.contains(entry.getKey())) {
                if (lowerQuery.indexOf("from " + entry.getKey()) != -1 || lowerQuery.indexOf(entry.getKey()) < lowerQuery.indexOf(" to ")) {
                    if (intent.getDepartureAirport() == null) intent.setDepartureAirport(entry.getValue());
                } else if (lowerQuery.indexOf("to " + entry.getKey()) != -1) {
                    intent.setArrivalAirport(entry.getValue());
                } else {
                    if (intent.getDepartureAirport() == null) {
                        intent.setDepartureAirport(entry.getValue());
                    } else if (intent.getArrivalAirport() == null) {
                        intent.setArrivalAirport(entry.getValue());
                    }
                }
            }
        }

        if (lowerQuery.contains("morning")) intent.setTimePreference("morning");
        else if (lowerQuery.contains("afternoon")) intent.setTimePreference("afternoon");
        else if (lowerQuery.contains("evening")) intent.setTimePreference("evening");
        else if (lowerQuery.contains("night")) intent.setTimePreference("night");

        if (lowerQuery.contains("cheapest")) intent.setSortBy("price");
        else if (lowerQuery.contains("fastest")) intent.setSortBy("duration");
        else if (lowerQuery.contains("earliest")) intent.setSortBy("departureTime");

        intent.setDate("2026-08-01");

        return intent;
    }
}
