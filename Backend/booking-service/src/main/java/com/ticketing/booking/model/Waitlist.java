package com.ticketing.booking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "waitlist")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Waitlist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String passengerId;
    
    private String passengerName;
    
    private String passengerEmail;

    private String flightId;

    @Enumerated(EnumType.STRING)
    private SeatClass preferredSeatClass;

    private Integer queuePosition;

    @Enumerated(EnumType.STRING)
    private WaitlistStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
