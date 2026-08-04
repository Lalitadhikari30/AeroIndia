package com.ticketing.notification.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingEvent {
    private String eventType;
    private String bookingId;
    private String pnr;
    private String passengerId;
    private String passengerName;
    private String passengerEmail;
    private String flightId;
    private String flightNumber;
    private String seatNumber;
    private String departureAirport;
    private String arrivalAirport;
    private String departureTime;
    private BigDecimal totalPrice;
    private String status;
    private LocalDateTime timestamp;
}
