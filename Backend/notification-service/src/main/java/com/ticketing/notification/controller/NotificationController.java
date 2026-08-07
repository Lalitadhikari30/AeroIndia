package com.ticketing.notification.controller;

import com.ticketing.notification.consumer.NotificationEventConsumer;
import com.ticketing.notification.dto.BookingCancelledEvent;
import com.ticketing.notification.dto.NotificationStats;
import com.ticketing.notification.dto.PaymentAbandonedEvent;
import com.ticketing.notification.dto.PaymentSuccessEvent;
import com.ticketing.notification.dto.SearchAbandonedEvent;
import com.ticketing.notification.dto.UserRegisteredEvent;
import com.ticketing.notification.event.BookingEvent;
import com.ticketing.notification.model.NotificationLog;
import com.ticketing.notification.service.EmailService;
import com.ticketing.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@Tag(name = "Notifications", description = "Notification Management APIs")
public class NotificationController {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final NotificationEventConsumer eventConsumer;

    public NotificationController(NotificationService notificationService, 
                                  EmailService emailService,
                                  NotificationEventConsumer eventConsumer) {
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.eventConsumer = eventConsumer;
    }

    @GetMapping("/recent")
    public ResponseEntity<List<NotificationLog>> getRecentNotifications() {
        return ResponseEntity.ok(notificationService.getRecentNotifications());
    }

    @GetMapping("/stats")
    public ResponseEntity<NotificationStats> getNotificationStats() {
        return ResponseEntity.ok(notificationService.getNotificationStats());
    }

    @PostMapping("/welcome")
    public ResponseEntity<NotificationLog> sendWelcomeNotification(@RequestBody UserRegisteredEvent event) {
        NotificationLog log = emailService.sendWelcomeEmail(event);
        return ResponseEntity.ok(log);
    }

    @PostMapping("/booking-confirmed")
    public ResponseEntity<NotificationLog> sendBookingConfirmedNotification(@RequestBody BookingEvent event) {
        NotificationLog log = emailService.sendBookingConfirmation(event);
        return ResponseEntity.ok(log);
    }

    @PostMapping("/abandoned-search")
    public ResponseEntity<NotificationLog> sendAbandonedSearchNotification(@RequestBody SearchAbandonedEvent event) {
        NotificationLog log = emailService.sendAbandonedSearchNotice(event);
        return ResponseEntity.ok(log);
    }

    @PostMapping("/abandoned-payment")
    public ResponseEntity<NotificationLog> sendAbandonedPaymentNotification(@RequestBody PaymentAbandonedEvent event) {
        NotificationLog log = emailService.sendAbandonedPaymentNotice(event);
        return ResponseEntity.ok(log);
    }

    @PostMapping("/test/booking")
    public ResponseEntity<Map<String, Object>> testBookingEmail(@RequestParam(defaultValue = "passenger@aeroindia.com") String recipientEmail) {
        BookingEvent event = BookingEvent.builder()
                .eventType("BOOKING_CONFIRMED")
                .bookingId("B-1002")
                .pnr("AI-9842")
                .passengerName("Rajesh Kumar")
                .passengerEmail(recipientEmail)
                .flightNumber("AI-801")
                .departureAirport("DEL")
                .arrivalAirport("BOM")
                .departureTime("2026-08-05")
                .seatNumber("12A")
                .totalPrice(new BigDecimal("6800.00"))
                .build();

        eventConsumer.processBookingConfirmed(event);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Booking confirmation email dispatched via Gmail SMTP", "recipient", recipientEmail));
    }

    @PostMapping("/test/payment")
    public ResponseEntity<Map<String, Object>> testPaymentEmail(@RequestParam(defaultValue = "passenger@aeroindia.com") String recipientEmail) {
        PaymentSuccessEvent event = PaymentSuccessEvent.builder()
                .passengerName("Rajesh Kumar")
                .passengerEmail(recipientEmail)
                .bookingId("B-1002")
                .pnr("AI-9842")
                .flightNumber("AI-801")
                .route("DEL -> BOM")
                .amountPaid(new BigDecimal("6800.00"))
                .transactionId("TXN-" + System.currentTimeMillis())
                .paymentDate(LocalDateTime.now())
                .build();

        eventConsumer.processPaymentSuccess(event);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Payment success email dispatched via Gmail SMTP", "recipient", recipientEmail));
    }

    @PostMapping("/test/cancellation")
    public ResponseEntity<Map<String, Object>> testCancellationEmail(@RequestParam(defaultValue = "passenger@aeroindia.com") String recipientEmail) {
        BookingCancelledEvent event = BookingCancelledEvent.builder()
                .passengerName("Rajesh Kumar")
                .passengerEmail(recipientEmail)
                .bookingId("B-1002")
                .pnr("AI-9842")
                .flightNumber("AI-801")
                .route("DEL -> BOM")
                .cancellationReason("User Requested Cancellation")
                .refundAmount(new BigDecimal("6200.00"))
                .cancellationDate(LocalDateTime.now())
                .build();

        eventConsumer.processBookingCancelled(event);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Booking cancellation email dispatched via Gmail SMTP", "recipient", recipientEmail));
    }
}
