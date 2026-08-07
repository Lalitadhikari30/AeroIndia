package com.ticketing.genai.service;

import com.ticketing.genai.client.FlightServiceClient;
import com.ticketing.genai.dto.NaturalLanguageSearchRequest;
import com.ticketing.genai.dto.NaturalLanguageSearchResponse;
import com.ticketing.genai.dto.ParsedIntent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlightSearchAiService {

    private final IntentParserService intentParserService;
    private final FlightServiceClient flightServiceClient;
    private final GenerationService generationService;

    public NaturalLanguageSearchResponse searchFlights(NaturalLanguageSearchRequest request) {
        ParsedIntent intent = intentParserService.parseIntent(request.getQuery());

        String origin = intent.getDepartureAirport() != null ? intent.getDepartureAirport() : "DEL";
        String destination = intent.getArrivalAirport() != null ? intent.getArrivalAirport() : "BOM";
        String date = intent.getDate() != null ? intent.getDate() : "2026-08-01";

        List<Map<String, Object>> flights;
        try {
            flights = flightServiceClient.searchFlights(origin, destination, date);
            if (flights == null) flights = new ArrayList<>();
        } catch (Exception e) {
            log.error("Failed to query flightServiceClient: {}", e.getMessage());
            flights = new ArrayList<>();
        }

        String fallbackSummary = String.format("Found %d flights from %s to %s on %s.",
                flights.size(), origin, destination, date);

        String summary = fallbackSummary;
        try {
            String prompt = String.format("""
                    You are AeroIndia's flight assistant. Provide a brief 1-2 sentence conversational summary for the passenger about their flight search.

                    Passenger query: "%s"
                    Interpreted Route: %s to %s on %s
                    Matching Flights Found: %d
                    """, request.getQuery(), origin, destination, date, flights.size());

            String generated = generationService.generate(prompt);
            if (generated != null && !generated.isBlank()) {
                summary = generated.trim();
            }
        } catch (Exception e) {
            log.error("Gemini summary generation failed: {}. Using fallback summary.", e.getMessage());
        }

        return NaturalLanguageSearchResponse.builder()
                .originalQuery(request.getQuery())
                .interpretedIntent(intent)
                .flights(flights)
                .aiSummary(summary)
                .build();
    }
}
