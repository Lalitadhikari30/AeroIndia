package com.ticketing.notification.consumer;

import com.ticketing.notification.dto.BookingCancelledEvent;
import com.ticketing.notification.dto.PaymentSuccessEvent;
import com.ticketing.notification.event.BookingEvent;
import com.ticketing.notification.service.ResendEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventConsumer {

    private final ResendEmailService resendEmailService;
    private final TemplateEngine templateEngine;

    // Idempotency cache preventing duplicate email dispatches
    private final Set<String> processedEventKeys = ConcurrentHashMap.newKeySet();

    @KafkaListener(topics = "booking-events", groupId = "notification-service", autoStartup = "${spring.kafka.listener.auto-startup:false}")
    public void consumeBookingEvent(BookingEvent event) {
        if (event == null || event.getEventType() == null) return;

        String idempotencyKey = String.format("email-sent:%s:%s", event.getBookingId(), event.getEventType());
        if (processedEventKeys.contains(idempotencyKey)) {
            log.info("Idempotency check: Event {} for booking {} already processed. Skipping duplicate email.", event.getEventType(), event.getBookingId());
            return;
        }

        log.info("Received Kafka BookingEvent: {} for bookingId: {}", event.getEventType(), event.getBookingId());

        if ("BOOKING_CONFIRMED".equalsIgnoreCase(event.getEventType())) {
            processBookingConfirmed(event);
            processedEventKeys.add(idempotencyKey);
        } else if ("BOOKING_CANCELLED".equalsIgnoreCase(event.getEventType())) {
            processBookingCancelled(event);
            processedEventKeys.add(idempotencyKey);
        }
    }

    @KafkaListener(topics = "booking-confirmed", groupId = "notification-service", autoStartup = "${spring.kafka.listener.auto-startup:false}")
    public void consumeBookingConfirmed(BookingEvent event) {
        processBookingConfirmed(event);
    }

    @KafkaListener(topics = "payment-success", groupId = "notification-service", autoStartup = "${spring.kafka.listener.auto-startup:false}")
    public void consumePaymentSuccess(PaymentSuccessEvent event) {
        processPaymentSuccess(event);
    }

    @KafkaListener(topics = "booking-cancelled", groupId = "notification-service", autoStartup = "${spring.kafka.listener.auto-startup:false}")
    public void consumeBookingCancelled(BookingCancelledEvent event) {
        processBookingCancelled(event);
    }

    public void processBookingConfirmed(BookingEvent event) {
        try {
            Context ctx = new Context();
            ctx.setVariable("passengerName", event.getPassengerName() != null ? event.getPassengerName() : "Passenger");
            ctx.setVariable("pnr", event.getPnr() != null ? event.getPnr() : "AI-9842");
            ctx.setVariable("flightNumber", event.getFlightNumber() != null ? event.getFlightNumber() : "AI-801");
            ctx.setVariable("origin", event.getDepartureAirport() != null ? event.getDepartureAirport() : "DEL");
            ctx.setVariable("destination", event.getArrivalAirport() != null ? event.getArrivalAirport() : "BOM");
            ctx.setVariable("travelDate", event.getDepartureTime() != null ? event.getDepartureTime() : "2026-08-05");
            ctx.setVariable("seatNumber", event.getSeatNumber() != null ? event.getSeatNumber() : "12A");
            ctx.setVariable("fare", event.getTotalPrice() != null ? event.getTotalPrice().toString() : "6,800");

            String htmlBody = templateEngine.process("booking-confirmation", ctx);
            String subject = "✈ Booking Confirmed! E-Ticket for PNR: " + event.getPnr();

            resendEmailService.sendHtmlEmail(event.getPassengerEmail(), subject, htmlBody);
        } catch (Exception e) {
            log.error("Failed to render/send booking confirmation email for PNR {}", event.getPnr(), e);
        }
    }

    public void processPaymentSuccess(PaymentSuccessEvent event) {
        try {
            Context ctx = new Context();
            ctx.setVariable("passengerName", event.getPassengerName() != null ? event.getPassengerName() : "Passenger");
            ctx.setVariable("transactionId", event.getTransactionId() != null ? event.getTransactionId() : "TXN-884920");
            ctx.setVariable("bookingId", event.getBookingId() != null ? event.getBookingId() : "B-1002");
            ctx.setVariable("amountPaid", event.getAmountPaid() != null ? event.getAmountPaid().toString() : "6,800");
            ctx.setVariable("paymentDate", event.getPaymentDate() != null ? event.getPaymentDate().toString() : "2026-08-04");

            String htmlBody = templateEngine.process("payment-success", ctx);
            String subject = "💳 Payment Received — Tax Invoice for Booking " + event.getBookingId();

            resendEmailService.sendHtmlEmail(event.getPassengerEmail(), subject, htmlBody);
        } catch (Exception e) {
            log.error("Failed to render/send payment success email for booking {}", event.getBookingId(), e);
        }
    }

    public void processBookingCancelled(BookingEvent event) {
        try {
            Context ctx = new Context();
            ctx.setVariable("passengerName", event.getPassengerName() != null ? event.getPassengerName() : "Passenger");
            ctx.setVariable("bookingId", event.getBookingId() != null ? event.getBookingId() : "B-1002");
            ctx.setVariable("cancellationReason", "User Requested");
            ctx.setVariable("refundAmount", event.getTotalPrice() != null ? event.getTotalPrice().toString() : "6,200");

            String htmlBody = templateEngine.process("booking-cancellation", ctx);
            String subject = "✈ Booking Cancellation Notice — PNR: " + event.getPnr();

            resendEmailService.sendHtmlEmail(event.getPassengerEmail(), subject, htmlBody);
        } catch (Exception e) {
            log.error("Failed to render/send cancellation email for booking {}", event.getBookingId(), e);
        }
    }

    public void processBookingCancelled(BookingCancelledEvent event) {
        try {
            Context ctx = new Context();
            ctx.setVariable("passengerName", event.getPassengerName() != null ? event.getPassengerName() : "Passenger");
            ctx.setVariable("bookingId", event.getBookingId() != null ? event.getBookingId() : "B-1002");
            ctx.setVariable("cancellationReason", event.getCancellationReason() != null ? event.getCancellationReason() : "User Requested");
            ctx.setVariable("refundAmount", event.getRefundAmount() != null ? event.getRefundAmount().toString() : "6,200");

            String htmlBody = templateEngine.process("booking-cancellation", ctx);
            String subject = "✈ Booking Cancellation Notice — Booking: " + event.getBookingId();

            resendEmailService.sendHtmlEmail(event.getPassengerEmail(), subject, htmlBody);
        } catch (Exception e) {
            log.error("Failed to render/send cancellation email for booking {}", event.getBookingId(), e);
        }
    }
}
