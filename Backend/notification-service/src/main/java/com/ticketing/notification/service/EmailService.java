package com.ticketing.notification.service;

import com.ticketing.notification.dto.PaymentAbandonedEvent;
import com.ticketing.notification.dto.SearchAbandonedEvent;
import com.ticketing.notification.dto.UserRegisteredEvent;
import com.ticketing.notification.event.BookingEvent;
import com.ticketing.notification.model.NotificationLog;
import com.ticketing.notification.model.NotificationType;
import jakarta.mail.internet.InternetAddress;
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
import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    private static final Logger LOG = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private AeroIndiaEmailTemplates emailTemplates;

    @Value("${spring.mail.username:noreply@aeroindia.com}")
    private String fromEmail;

    @Value("${notification.email.from-name:Aeroइंडिया Flight Services}")
    private String fromName;

    public NotificationLog sendWelcomeEmail(UserRegisteredEvent event) {
        String name = (event.getPassengerName() != null && !event.getPassengerName().isBlank()) ? event.getPassengerName() : "Valued Member";
        String email = (event.getPassengerEmail() != null && !event.getPassengerEmail().isBlank()) ? event.getPassengerEmail() : "passenger@aeroindia.com";

        String htmlBody = emailTemplates.buildWelcomeEmail(name, email);
        String subject = "✈ Welcome to AeroIndia! Here is 15% OFF your first flight";
        dispatchEmail(email, subject, htmlBody);

        return NotificationLog.builder()
                .id(UUID.randomUUID())
                .recipientEmail(email)
                .type(NotificationType.EMAIL)
                .subject(subject)
                .body("Welcome email sent to " + email)
                .sentAt(LocalDateTime.now())
                .eventType("USER_REGISTERED")
                .build();
    }

    public NotificationLog sendBookingConfirmation(BookingEvent event) {
        String email = (event.getPassengerEmail() != null && !event.getPassengerEmail().isBlank()) ? event.getPassengerEmail() : "passenger@aeroindia.com";
        String pnr = (event.getPnr() != null && !event.getPnr().isBlank()) ? event.getPnr() : "AI-CONFIRMED";

        String htmlBody = emailTemplates.buildBookingConfirmationEmail(event);
        String subject = "✈ Booking Confirmed! E-Ticket for PNR: " + pnr;
        dispatchEmail(email, subject, htmlBody);

        return buildLog(event, subject, "Booking confirmation email sent for PNR " + pnr);
    }

    public NotificationLog sendAbandonedSearchNotice(SearchAbandonedEvent event) {
        String name = (event.getPassengerName() != null && !event.getPassengerName().isBlank()) ? event.getPassengerName() : "Valued Traveler";
        String email = (event.getPassengerEmail() != null && !event.getPassengerEmail().isBlank()) ? event.getPassengerEmail() : "passenger@aeroindia.com";
        String from = (event.getFromCity() != null && !event.getFromCity().isBlank()) ? event.getFromCity() : "Delhi";
        String to = (event.getToCity() != null && !event.getToCity().isBlank()) ? event.getToCity() : "Mumbai";

        String htmlBody = emailTemplates.buildAbandonedSearchEmail(name, email, from, to, event.getDepartureDate());
        String subject = "✈ Price Drop Alert! Complete your booking from " + from + " to " + to;
        dispatchEmail(email, subject, htmlBody);

        return NotificationLog.builder()
                .id(UUID.randomUUID())
                .recipientEmail(email)
                .type(NotificationType.EMAIL)
                .subject(subject)
                .body("Abandoned search email sent for route " + from + " -> " + to)
                .sentAt(LocalDateTime.now())
                .eventType("ABANDONED_SEARCH")
                .build();
    }

    public NotificationLog sendAbandonedPaymentNotice(PaymentAbandonedEvent event) {
        String name = (event.getPassengerName() != null && !event.getPassengerName().isBlank()) ? event.getPassengerName() : "Valued Passenger";
        String email = (event.getPassengerEmail() != null && !event.getPassengerEmail().isBlank()) ? event.getPassengerEmail() : "passenger@aeroindia.com";
        String route = (event.getFlightRoute() != null && !event.getFlightRoute().isBlank()) ? event.getFlightRoute() : "New Delhi (DEL) to Mumbai (BOM)";
        String pnr = (event.getPnr() != null && !event.getPnr().isBlank()) ? event.getPnr() : "AI-PENDING-" + (1000 + (int)(Math.random()*9000));
        Double amount = event.getAmount() != null ? event.getAmount() : 6800.0;

        String htmlBody = emailTemplates.buildAbandonedPaymentEmail(name, email, pnr, route, amount);
        String subject = "⏳ Complete your booking for " + route + " — Special ₹500 Discount Inside";
        dispatchEmail(email, subject, htmlBody);

        return NotificationLog.builder()
                .id(UUID.randomUUID())
                .recipientEmail(email)
                .type(NotificationType.EMAIL)
                .subject(subject)
                .body("Abandoned payment email sent for " + route)
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

    /**
     * Sends an HTML email via Gmail SMTP (JavaMailSender).
     * Public so that NotificationEventConsumer can also use it for Thymeleaf-rendered templates.
     */
    public void sendHtmlEmail(String recipientEmail, String subject, String htmlContent) {
        dispatchEmail(recipientEmail, subject, htmlContent);
    }

    private void dispatchEmail(String recipientEmail, String subject, String htmlContent) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            LOG.warn("⚠ No recipient email provided, skipping email dispatch for subject: {}", subject);
            return;
        }

        // Run SMTP dispatch in a background thread so it never blocks the HTTP response thread
        CompletableFuture.runAsync(() -> {
            try {
                if (fromEmail == null || fromEmail.isBlank() || "noreply@aeroindia.com".equals(fromEmail)) {
                    LOG.warn("⚠ GMAIL_USERNAME is not configured or using default placeholder ({}). Emails may fail SMTP auth.", fromEmail);
                }

                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(new InternetAddress(fromEmail, fromName, "UTF-8"));
                helper.setTo(recipientEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(message);
                LOG.info("✅ Email dispatched successfully via Gmail SMTP to {}", recipientEmail);
            } catch (Exception e) {
                LOG.error("❌ Failed to send email to {}: {}. Make sure GMAIL_USERNAME and GMAIL_APP_PASSWORD (16-char App Password) are correctly set in Render environment variables.", recipientEmail, e.getMessage(), e);
            }
        });
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
