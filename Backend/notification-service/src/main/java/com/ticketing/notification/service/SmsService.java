package com.ticketing.notification.service;

import com.ticketing.notification.event.BookingEvent;
import com.ticketing.notification.model.NotificationLog;
import com.ticketing.notification.model.NotificationType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class SmsService {

    private static final Logger LOG = LoggerFactory.getLogger(SmsService.class);

    public NotificationLog sendBookingConfirmationSms(BookingEvent event) {
        String body = String.format("SMS to %s: Your flight %s (%s→%s) is booked! PNR: %s. Seat: %s. Happy journey!",
                event.getPassengerEmail(), event.getFlightNumber(), event.getDepartureAirport(),
                event.getArrivalAirport(), event.getPnr(), event.getSeatNumber());

        LOG.info(body);
        return buildLog(event, body);
    }

    public NotificationLog sendCancellationSms(BookingEvent event) {
        String body = String.format("SMS to %s: Your booking %s is cancelled. Refund of Rs.%s initiated.",
                event.getPassengerEmail(), event.getPnr(), event.getTotalPrice());

        LOG.info(body);
        return buildLog(event, body);
    }

    public NotificationLog sendWaitlistPromotionSms(BookingEvent event) {
        String body = String.format("SMS to %s: Your waitlisted ticket %s is now CONFIRMED. Seat: %s.",
                event.getPassengerEmail(), event.getPnr(), event.getSeatNumber());

        LOG.info(body);
        return buildLog(event, body);
    }

    private NotificationLog buildLog(BookingEvent event, String body) {
        // Mock phone number logic, normally we'd have a phone number in the event
        String mockPhone = "+919999999999";
        return NotificationLog.builder()
                .id(UUID.randomUUID())
                .recipientPhone(mockPhone)
                .type(NotificationType.SMS)
                .subject("SMS Notification")
                .body(body)
                .sentAt(LocalDateTime.now())
                .eventType(event.getEventType())
                .build();
    }
}
