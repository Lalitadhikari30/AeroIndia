package com.ticketing.booking.consumer;

import com.ticketing.booking.event.BookingEventPublisher;
import com.ticketing.booking.model.Waitlist;
import com.ticketing.booking.model.WaitlistStatus;
import com.ticketing.booking.repository.WaitlistRepository;
import com.ticketing.booking.service.WaitlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "spring.kafka.bootstrap-servers")
public class WaitlistConsumer {

    private final WaitlistRepository waitlistRepository;
    private final WaitlistService waitlistService;
    private final BookingEventPublisher eventPublisher;

    @KafkaListener(topics = "booking-waitlist", groupId = "booking-waitlist-processor")
    public void processWaitlist(String waitlistIdStr) {
        try {
            UUID waitlistId = UUID.fromString(waitlistIdStr);
            log.info("Processing waitlist entry {}", waitlistId);
            
            Optional<Waitlist> waitlistOpt = waitlistRepository.findById(waitlistId);
            if (waitlistOpt.isEmpty() || waitlistOpt.get().getStatus() != WaitlistStatus.WAITING) {
                return;
            }
            
            Waitlist waitlist = waitlistOpt.get();
            
            // Logic to attempt booking for this waitlist user goes here
            // This would normally call flight service to check if seat is ACTUALLY available
            // and if so, trigger the createBooking flow internally
            
            // For now, we simulate success
            boolean seatAvailable = true; 
            
            if (seatAvailable) {
                waitlistService.markPromoted(waitlistId);
                // Also trigger event
                // In real world, we'd create the booking first, then publish the event
                log.info("Waitlist entry {} successfully promoted", waitlistId);
            }
            
        } catch (Exception e) {
            log.error("Failed to process waitlist entry {}", waitlistIdStr, e);
        }
    }
}
