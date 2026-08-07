package com.ticketing.flight.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class SeatMapConverter implements AttributeConverter<SeatMap, String> {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(SeatMap seatMap) {
        if (seatMap == null) return null;
        try {
            return objectMapper.writeValueAsString(seatMap);
        } catch (Exception e) {
            throw new RuntimeException("Error converting SeatMap to JSON", e);
        }
    }

    @Override
    public SeatMap convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return null;
        try {
            return objectMapper.readValue(dbData, SeatMap.class);
        } catch (Exception e) {
            throw new RuntimeException("Error reading SeatMap from JSON", e);
        }
    }
}
