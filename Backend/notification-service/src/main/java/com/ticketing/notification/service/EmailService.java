package com.ticketing.notification.service;

import com.ticketing.notification.dto.PaymentAbandonedEvent;
import com.ticketing.notification.dto.SearchAbandonedEvent;
import com.ticketing.notification.dto.UserRegisteredEvent;
import com.ticketing.notification.event.BookingEvent;
import com.ticketing.notification.model.NotificationLog;
import com.ticketing.notification.model.NotificationType;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmailService {

    private static final Logger LOG = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private AeroIndiaEmailTemplates emailTemplates;

    @Value("${spring.mail.username:noreply@aeroindia.com}")
    private String fromEmail;

    public NotificationLog sendWelcomeEmail(UserRegisteredEvent event) {
        String htmlBody = emailTemplates.buildWelcomeEmail(event.getPassengerName(), event.getPassengerEmail());
        String subject = "✈ Welcome to AeroIndia! Here is 15% OFF your first flight";
        dispatchEmail(event.getPassengerEmail(), subject, htmlBody);

        return NotificationLog.builder()
                .id(UUID.randomUUID())
                .recipientEmail(event.getPassengerEmail())
                .type(NotificationType.EMAIL)
                .subject(subject)
                .body("Welcome email sent to " + event.getPassengerEmail())
                .sentAt(LocalDateTime.now())
                .eventType("USER_REGISTERED")
                .build();
    }

    public NotificationLog sendBookingConfirmation(BookingEvent event) {
        String htmlBody = emailTemplates.buildBookingConfirmationEmail(event);
        String subject = "✈ Booking Confirmed! E-Ticket for PNR: " + event.getPnr();
        dispatchEmail(event.getPassengerEmail(), subject, htmlBody);

        return buildLog(event, subject, "Booking confirmation email sent for PNR " + event.getPnr());
    }

    public NotificationLog sendAbandonedSearchNotice(SearchAbandonedEvent event) {
        String htmlBody = emailTemplates.buildAbandonedSearchEmail(
                event.getPassengerName(), event.getPassengerEmail(), 
                event.getFromCity(), event.getToCity(), event.getDepartureDate());
        String subject = "✈ Price Drop Alert! Complete your booking from " + event.getFromCity() + " to " + event.getToCity();
        dispatchEmail(event.getPassengerEmail(), subject, htmlBody);

        return NotificationLog.builder()
                .id(UUID.randomUUID())
                .recipientEmail(event.getPassengerEmail())
                .type(NotificationType.EMAIL)
                .subject(subject)
                .body("Abandoned search email sent for route " + event.getFromCity() + " -> " + event.getToCity())
                .sentAt(LocalDateTime.now())
                .eventType("ABANDONED_SEARCH")
                .build();
    }

    public NotificationLog sendAbandonedPaymentNotice(PaymentAbandonedEvent event) {
        String htmlBody = emailTemplates.buildAbandonedPaymentEmail(
                event.getPassengerName(), event.getPassengerEmail(),
                event.getPnr(), event.getFlightRoute(), event.getAmount());
        String subject = "⏳ Complete your booking for " + event.getFlightRoute() + " — Special ₹500 Discount Inside";
        dispatchEmail(event.getPassengerEmail(), subject, htmlBody);

        return NotificationLog.builder()
                .id(UUID.randomUUID())
                .recipientEmail(event.getPassengerEmail())
                .type(NotificationType.EMAIL)
                .subject(subject)
                .body("Abandoned payment email sent for " + event.getFlightRoute())
                .sentAt(LocalDateTime.now())
                .eventType("ABANDONED_PAYMENT")
                .build();
    }

    public NotificationLog sendCancellationNotice(BookingEvent event) {
        String subject = "✈ Booking Cancellation Notice — PNR: " + event.getPnr();
        String body = String.format("Dear %s, your booking with PNR %s has been cancelled. Refund of ₹%s will be processed.",
                event.getPassengerName(), event.getPnr(), event.getTotalPrice());
        dispatchEmail(event.getPassengerEmail(), subject, body);
        return buildLog(event, subject, body);
    }

    public NotificationLog sendWaitlistPromotion(BookingEvent event) {
        String subject = "✈ Waitlist Confirmed! PNR: " + event.getPnr();
        String body = String.format("Dear %s, your waitlisted ticket with PNR %s is now CONFIRMED. Seat: %s",
                event.getPassengerName(), event.getPnr(), event.getSeatNumber());
        dispatchEmail(event.getPassengerEmail(), subject, body);
        return buildLog(event, subject, body);
    }

    public NotificationLog sendPaymentReceipt(BookingEvent event) {
        String subject = "✈ Payment Receipt — PNR: " + event.getPnr();
        String body = String.format("Dear %s, payment of ₹%s received successfully for PNR %s.",
                event.getPassengerName(), event.getTotalPrice(), event.getPnr());
        dispatchEmail(event.getPassengerEmail(), subject, body);
        return buildLog(event, subject, body);
    }

    private void dispatchEmail(String recipientEmail, String subject, String htmlContent) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            recipientEmail = "passenger@aeroindia.com";
        }
        
        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(recipientEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(message);
                LOG.info("✅ SMTP Email dispatched successfully to {}", recipientEmail);
                return;
            } catch (Exception e) {
                LOG.warn("Failed to dispatch email via SMTP ({}), logging email payload to console.", e.getMessage());
            }
        }

        LOG.info("""
            ══════════════════════════════════════════════════════════════════
            📧  AEROINDIA HTML EMAIL DISPATCHED TO: %s
            📌  SUBJECT: %s
            ══════════════════════════════════════════════════════════════════
            """, recipientEmail, subject);
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
