package com.ticketing.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightSearchResponse {
    private List<FlightSummary> flights;
    private List<ConnectingFlight> connecting;
}
