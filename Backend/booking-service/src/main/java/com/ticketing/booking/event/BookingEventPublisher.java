package com.ticketing.booking.event;

import com.ticketing.booking.model.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@Slf4j
public class BookingEventPublisher {

    private final KafkaTemplate<String, BookingEvent> kafkaTemplate;

    public BookingEventPublisher(@Autowired(required = false) KafkaTemplate<String, BookingEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    private static final String TOPIC = "booking-events";

    public void publishBookingCreated(Booking booking) {
        publishEvent("BOOKING_CREATED", booking);
    }

    public void publishBookingConfirmed(Booking booking) {
        publishEvent("BOOKING_CONFIRMED", booking);
    }

    public void publishBookingCancelled(Booking booking) {
        publishEvent("BOOKING_CANCELLED", booking);
    }

    public void publishSeatFreed(String flightId, String seatNumber) {
        if (kafkaTemplate == null) return;
        BookingEvent event = BookingEvent.builder()
                .eventType("SEAT_FREED")
                .flightId(flightId)
                .seatNumber(seatNumber)
                .timestamp(LocalDateTime.now())
                .build();
        sendToKafka(UUID.randomUUID().toString(), event);
    }

    public void publishWaitlistPromoted(Booking booking) {
        publishEvent("WAITLIST_PROMOTED", booking);
    }

    private void publishEvent(String eventType, Booking booking) {
        if (kafkaTemplate == null) {
            log.warn("Kafka is not configured. Skipping event publication for {}", eventType);
            return;
        }
        
        BookingEvent event = BookingEvent.builder()
                .eventType(eventType)
                .bookingId(booking.getId().toString())
                .pnr(booking.getPnr())
                .passengerId(booking.getPassengerId())
                .passengerName(booking.getPassengerName())
                .passengerEmail(booking.getPassengerEmail())
                .flightId(booking.getFlightId())
                .flightNumber(booking.getFlightNumber())
                .seatNumber(booking.getSeatNumber())
                .departureAirport(booking.getDepartureAirport())
                .arrivalAirport(booking.getArrivalAirport())
                .departureTime(booking.getDepartureTime() != null ? booking.getDepartureTime().toString() : null)
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus().name())
                .timestamp(LocalDateTime.now())
                .build();

        sendToKafka(booking.getId().toString(), event);
    }

    private void sendToKafka(String key, BookingEvent event) {
        try {
            kafkaTemplate.send(TOPIC, key, event);
            log.info("Published event {} to topic {} with key {}", event.getEventType(), TOPIC, key);
        } catch (Exception e) {
            log.error("Failed to publish event {} to Kafka: {}", event.getEventType(), e.getMessage(), e);
        }
    }
}
