package com.ticketing.booking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String passengerId;

    private String passengerName;
    
    private String passengerEmail;

    @Column(nullable = false)
    private String flightId;

    private String flightNumber;

    private String seatNumber;

    @Enumerated(EnumType.STRING)
    private SeatClass seatClass;

    private String departureAirport;
    
    private String arrivalAirport;

    private LocalDateTime departureTime;

    private BigDecimal basePrice;
    
    private BigDecimal totalPrice;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(unique = true)
    private String pnr;

    @Column(unique = true)
    private String idempotencyKey;

    @Version
    private Long version;

    @Builder.Default
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingAddOn> addOns = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
