package com.ticketing.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSuccessEvent {
    private String passengerName;
    private String passengerEmail;
    private String bookingId;
    private String pnr;
    private String flightNumber;
    private String route;
    private BigDecimal amountPaid;
    private String transactionId;
    private LocalDateTime paymentDate;
}
