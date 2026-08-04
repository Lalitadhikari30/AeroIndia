package com.ticketing.booking.repository;

import com.ticketing.booking.model.Waitlist;
import com.ticketing.booking.model.WaitlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, UUID> {
    List<Waitlist> findByFlightIdAndStatusOrderByQueuePositionAsc(String flightId, WaitlistStatus status);
    Optional<Waitlist> findFirstByFlightIdAndStatusOrderByQueuePositionAsc(String flightId, WaitlistStatus status);
    int countByFlightIdAndStatus(String flightId, WaitlistStatus status);
}
