package com.ticketing.booking.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingEvent implements Serializable {
    private String eventType; // BOOKING_CREATED, BOOKING_CONFIRMED, BOOKING_CANCELLED, SEAT_FREED, WAITLIST_PROMOTED
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
