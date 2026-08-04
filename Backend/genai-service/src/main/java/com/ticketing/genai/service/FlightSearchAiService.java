package com.ticketing.genai.service;

import com.ticketing.genai.client.FlightServiceClient;
import com.ticketing.genai.dto.NaturalLanguageSearchRequest;
import com.ticketing.genai.dto.NaturalLanguageSearchResponse;
import com.ticketing.genai.dto.ParsedIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FlightSearchAiService {

    private final IntentParserService intentParserService;
    private final FlightServiceClient flightServiceClient;

    public NaturalLanguageSearchResponse searchFlights(NaturalLanguageSearchRequest request) {
        ParsedIntent intent = intentParserService.parseIntent(request.getQuery());
        
        List<Map<String, Object>> flights;
        try {
            flights = flightServiceClient.searchFlights(
                intent.getDepartureAirport() != null ? intent.getDepartureAirport() : "DEL",
                intent.getArrivalAirport() != null ? intent.getArrivalAirport() : "BOM",
                intent.getDate() != null ? intent.getDate() : "2026-08-01"
            );
        } catch (Exception e) {
            flights = new ArrayList<>();
        }
        
        String summary = String.format("Found %d flights from %s to %s on %s.", 
            flights.size(), 
            intent.getDepartureAirport(), 
            intent.getArrivalAirport(), 
            intent.getDate());
            
        return NaturalLanguageSearchResponse.builder()
                .originalQuery(request.getQuery())
                .interpretedIntent(intent)
                .flights(flights)
                .aiSummary(summary)
                .build();
    }
}
