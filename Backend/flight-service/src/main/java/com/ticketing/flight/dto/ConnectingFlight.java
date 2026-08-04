package com.ticketing.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectingFlight {
    private List<FlightSummary> legs;
    private String totalDuration;
    private BigDecimal totalPrice;
    private String layoverAirport;
    private String layoverDuration;
}
