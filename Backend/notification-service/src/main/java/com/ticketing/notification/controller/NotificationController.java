package com.ticketing.notification.controller;

import com.ticketing.notification.dto.NotificationStats;
import com.ticketing.notification.dto.PaymentAbandonedEvent;
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

@RestController
@RequestMapping
@Tag(name = "Notifications", description = "Notification Management APIs")
public class NotificationController {

    private final NotificationService notificationService;
    private final EmailService emailService;

    public NotificationController(NotificationService notificationService, EmailService emailService) {
        this.notificationService = notificationService;
        this.emailService = emailService;
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

    @PostMapping("/test")
    public ResponseEntity<String> sendTestNotification(@RequestParam(defaultValue = "BOOKING_CONFIRMED") String eventType) {
        BookingEvent event = BookingEvent.builder()
                .eventType(eventType)
                .bookingId("B1001")
                .pnr("AI-9842")
                .passengerId("P123")
                .passengerName("John Doe")
                .passengerEmail("johndoe@example.com")
                .flightId("F456")
                .flightNumber("AI-101")
                .seatNumber("12A")
                .departureAirport("DEL")
                .arrivalAirport("BOM")
                .departureTime(LocalDateTime.now().plusDays(2).toString())
                .totalPrice(new BigDecimal("5400.00"))
                .status("CONFIRMED")
                .timestamp(LocalDateTime.now())
                .build();
                
        notificationService.processBookingEvent(event);
        return ResponseEntity.ok("Test notification sent for event type: " + eventType);
    }
}
