package com.ticketing.notification.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchAbandonedEvent {
    @JsonAlias({"name", "user", "userName", "name"})
    private String passengerName;

    @JsonAlias({"email", "recipientEmail", "to", "userEmail"})
    private String passengerEmail;

    @JsonAlias({"from", "departureAirport", "origin"})
    private String fromCity;

    @JsonAlias({"to", "arrivalAirport", "destination"})
    private String toCity;

    private String departureDate;
}
