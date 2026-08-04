package com.ticketing.flight.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightSearchRequest {
    
    @NotBlank(message = "Departure airport is required")
    private String departureAirport;
    
    @NotBlank(message = "Arrival airport is required")
    private String arrivalAirport;
    
    @NotNull(message = "Departure date is required")
    private LocalDate departureDate;
    
    @Builder.Default
    private int passengers = 1;
    
    private String seatClass;
}
