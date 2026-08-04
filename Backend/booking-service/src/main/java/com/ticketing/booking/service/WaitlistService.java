package com.ticketing.booking.service;

import com.ticketing.booking.dto.WaitlistRequest;
import com.ticketing.booking.dto.WaitlistResponse;
import com.ticketing.booking.model.Waitlist;
import com.ticketing.booking.model.WaitlistStatus;
import com.ticketing.booking.repository.WaitlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional
    public WaitlistResponse addToWaitlist(WaitlistRequest req, String passengerId) {
        int currentQueueSize = waitlistRepository.countByFlightIdAndStatus(req.getFlightId(), WaitlistStatus.WAITING);
        
        Waitlist waitlist = Waitlist.builder()
                .passengerId(passengerId)
                .passengerName(req.getPassengerName())
                .passengerEmail(req.getPassengerEmail())
                .flightId(req.getFlightId())
                .preferredSeatClass(req.getPreferredSeatClass())
                .queuePosition(currentQueueSize + 1)
                .status(WaitlistStatus.WAITING)
                .build();

        waitlist = waitlistRepository.save(waitlist);

        // Publish to Kafka
        if (kafkaTemplate != null) {
            try {
                kafkaTemplate.send("booking-waitlist", waitlist.getFlightId(), waitlist.getId().toString());
                log.info("Published waitlist entry {} to topic booking-waitlist", waitlist.getId());
            } catch (Exception e) {
                log.error("Failed to publish waitlist entry to Kafka", e);
            }
        }

        return mapToResponse(waitlist);
    }

    @Transactional
    public void promoteFromWaitlist(String flightId, String seatClass) {
        Optional<Waitlist> firstWaiting = waitlistRepository.findFirstByFlightIdAndStatusOrderByQueuePositionAsc(flightId, WaitlistStatus.WAITING);
        
        if (firstWaiting.isPresent()) {
            Waitlist waitlist = firstWaiting.get();
            // The actual promotion logic (creating a booking) will be handled by WaitlistConsumer
            // to decouple the waitlist promotion process.
            if (kafkaTemplate != null) {
                try {
                    kafkaTemplate.send("booking-waitlist", flightId, waitlist.getId().toString());
                    log.info("Triggered waitlist processing for waitlist id {}", waitlist.getId());
                } catch (Exception e) {
                    log.error("Failed to trigger waitlist processing to Kafka", e);
                }
            }
        }
    }

    public List<WaitlistResponse> getWaitlistForFlight(String flightId) {
        return waitlistRepository.findByFlightIdAndStatusOrderByQueuePositionAsc(flightId, WaitlistStatus.WAITING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelWaitlistEntry(UUID waitlistId) {
        waitlistRepository.findById(waitlistId).ifPresent(waitlist -> {
            waitlist.setStatus(WaitlistStatus.CANCELLED);
            waitlistRepository.save(waitlist);
            log.info("Cancelled waitlist entry: {}", waitlistId);
        });
    }
    
    @Transactional
    public void markPromoted(UUID waitlistId) {
        waitlistRepository.findById(waitlistId).ifPresent(waitlist -> {
            waitlist.setStatus(WaitlistStatus.PROMOTED);
            waitlistRepository.save(waitlist);
            log.info("Promoted waitlist entry: {}", waitlistId);
        });
    }

    private WaitlistResponse mapToResponse(Waitlist waitlist) {
        return WaitlistResponse.builder()
                .id(waitlist.getId())
                .passengerId(waitlist.getPassengerId())
                .flightId(waitlist.getFlightId())
                .preferredSeatClass(waitlist.getPreferredSeatClass())
                .queuePosition(waitlist.getQueuePosition())
                .status(waitlist.getStatus())
                .createdAt(waitlist.getCreatedAt())
                .build();
    }
}
