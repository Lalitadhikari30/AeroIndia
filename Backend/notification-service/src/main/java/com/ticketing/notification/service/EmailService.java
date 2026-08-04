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
public class EmailService {

    private static final Logger LOG = LoggerFactory.getLogger(EmailService.class);

    public NotificationLog sendBookingConfirmation(BookingEvent event) {
        String body = String.format("""
            ══════════════════════════════════════════
            ✈  BOOKING CONFIRMATION — AAI Ticketing
            ══════════════════════════════════════════
            Dear %s,

            Your booking has been confirmed!

            PNR: %s
            Flight: %s
            Route: %s → %s
            Departure: %s
            Seat: %s
            Amount Paid: ₹%s

            Thank you for choosing AAI Ticketing.
            ══════════════════════════════════════════
            """,
            event.getPassengerName(), event.getPnr(), event.getFlightNumber(),
            event.getDepartureAirport(), event.getArrivalAirport(),
            event.getDepartureTime(), event.getSeatNumber(), event.getTotalPrice());

        LOG.info("Sending Booking Confirmation Email to {}\n{}", event.getPassengerEmail(), body);

        return buildLog(event, "Booking Confirmation", body);
    }

    public NotificationLog sendCancellationNotice(BookingEvent event) {
        String body = String.format("""
            ══════════════════════════════════════════
            ✈  BOOKING CANCELLATION — AAI Ticketing
            ══════════════════════════════════════════
            Dear %s,

            Your booking with PNR %s has been cancelled.
            Refund of ₹%s will be processed shortly.

            Thank you.
            ══════════════════════════════════════════
            """,
            event.getPassengerName(), event.getPnr(), event.getTotalPrice());

        LOG.info("Sending Cancellation Email to {}\n{}", event.getPassengerEmail(), body);

        return buildLog(event, "Booking Cancellation", body);
    }

    public NotificationLog sendWaitlistPromotion(BookingEvent event) {
        String body = String.format("""
            ══════════════════════════════════════════
            ✈  WAITLIST CONFIRMED — AAI Ticketing
            ══════════════════════════════════════════
            Dear %s,

            Good news! Your waitlisted ticket with PNR %s is now CONFIRMED.
            Seat: %s

            Thank you.
            ══════════════════════════════════════════
            """,
            event.getPassengerName(), event.getPnr(), event.getSeatNumber());

        LOG.info("Sending Waitlist Promotion Email to {}\n{}", event.getPassengerEmail(), body);

        return buildLog(event, "Waitlist Confirmed", body);
    }

    public NotificationLog sendPaymentReceipt(BookingEvent event) {
        String body = String.format("""
            ══════════════════════════════════════════
            ✈  PAYMENT RECEIPT — AAI Ticketing
            ══════════════════════════════════════════
            Dear %s,

            Payment of ₹%s received successfully for PNR %s.

            Thank you.
            ══════════════════════════════════════════
            """,
            event.getPassengerName(), event.getTotalPrice(), event.getPnr());

        LOG.info("Sending Payment Receipt Email to {}\n{}", event.getPassengerEmail(), body);

        return buildLog(event, "Payment Receipt", body);
    }

    private NotificationLog buildLog(BookingEvent event, String subject, String body) {
        return NotificationLog.builder()
                .id(UUID.randomUUID())
                .recipientEmail(event.getPassengerEmail())
                .type(NotificationType.EMAIL)
                .subject(subject)
                .body(body)
                .sentAt(LocalDateTime.now())
                .eventType(event.getEventType())
                .build();
    }
}
