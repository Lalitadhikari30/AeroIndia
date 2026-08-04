package com.ticketing.genai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParsedIntent {
    private String departureAirport;
    private String arrivalAirport;
    private String date;
    private String timePreference;
    private String sortBy;
    private BigDecimal maxPrice;
}
