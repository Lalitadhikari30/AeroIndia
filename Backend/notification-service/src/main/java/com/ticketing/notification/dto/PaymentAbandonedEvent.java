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
public class PaymentAbandonedEvent {
    @JsonAlias({"name", "user", "userName", "name"})
    private String passengerName;

    @JsonAlias({"email", "recipientEmail", "to", "userEmail"})
    private String passengerEmail;

    private String pnr;

    @JsonAlias({"route", "flight", "departure"})
    private String flightRoute;

    private Double amount;
}
