package com.ticketing.booking.dto;

import com.ticketing.booking.model.SeatClass;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotBlank(message = "Flight ID is required")
    private String flightId;

    @NotBlank(message = "Seat number is required")
    private String seatNumber;

    private SeatClass seatClass;

    @NotBlank(message = "Passenger name is required")
    private String passengerName;

    @Email(message = "Valid email is required")
    private String passengerEmail;

    @NotBlank(message = "Idempotency key is required")
    private String idempotencyKey;
}
