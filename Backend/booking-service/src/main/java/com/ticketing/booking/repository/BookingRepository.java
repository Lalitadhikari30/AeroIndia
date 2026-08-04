package com.ticketing.booking.repository;

import com.ticketing.booking.model.Booking;
import com.ticketing.booking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByPassengerIdOrderByCreatedAtDesc(String passengerId);
    Optional<Booking> findByPnr(String pnr);
    Optional<Booking> findByIdempotencyKey(String idempotencyKey);
    List<Booking> findByFlightIdAndStatus(String flightId, BookingStatus status);
    List<Booking> findByFlightId(String flightId);
}
