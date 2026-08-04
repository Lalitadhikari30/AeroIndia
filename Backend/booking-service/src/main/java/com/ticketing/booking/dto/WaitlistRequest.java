package com.ticketing.booking.dto;

import com.ticketing.booking.model.SeatClass;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaitlistRequest {
    
    @NotBlank(message = "Flight ID is required")
    private String flightId;

    @NotNull(message = "Preferred seat class is required")
    private SeatClass preferredSeatClass;

    private String passengerName;
    
    @Email(message = "Valid email is required")
    private String passengerEmail;
}
