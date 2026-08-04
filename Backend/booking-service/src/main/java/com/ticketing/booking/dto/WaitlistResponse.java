package com.ticketing.booking.dto;

import com.ticketing.booking.model.SeatClass;
import com.ticketing.booking.model.WaitlistStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaitlistResponse {
    private UUID id;
    private String passengerId;
    private String flightId;
    private SeatClass preferredSeatClass;
    private Integer queuePosition;
    private WaitlistStatus status;
    private LocalDateTime createdAt;
}
