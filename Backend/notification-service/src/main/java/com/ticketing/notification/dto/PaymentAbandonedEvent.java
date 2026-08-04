package com.ticketing.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAbandonedEvent {
    private String passengerName;
    private String passengerEmail;
    private String pnr;
    private String flightRoute;
    private Double amount;
}
