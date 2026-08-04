package com.ticketing.genai.service;

import com.ticketing.genai.dto.ParsedIntent;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class IntentParserService {

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
        String lowerQuery = naturalLanguageQuery.toLowerCase();
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
