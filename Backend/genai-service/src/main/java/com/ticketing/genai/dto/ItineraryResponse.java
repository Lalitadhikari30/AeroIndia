package com.ticketing.genai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryResponse {
    private String bookingId;
    private String itinerary;
    private LocalDateTime generatedAt;
}
