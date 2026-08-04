package com.ticketing.flight.dto;

import com.ticketing.flight.model.SeatMap;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatAvailabilityResponse {
    private String flightId;
    private String flightNumber;
    private int totalSeats;
    private int availableSeats;
    private double occupancyPercent;
    private SeatMap seatMap;
    private double currentPriceMultiplier;
}
