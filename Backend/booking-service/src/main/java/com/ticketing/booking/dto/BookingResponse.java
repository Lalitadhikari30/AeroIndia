package com.ticketing.booking.dto;

import com.ticketing.booking.model.BookingStatus;
import com.ticketing.booking.model.SeatClass;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private UUID id;
    private String pnr;
    private String passengerId;
    private String passengerName;
    private String flightId;
    private String flightNumber;
    private String seatNumber;
    private SeatClass seatClass;
    private String departureAirport;
    private String arrivalAirport;
    private LocalDateTime departureTime;
    private BigDecimal basePrice;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private List<AddOnResponse> addOns;
    private LocalDateTime createdAt;
}
