package com.ticketing.notification.consumer;

import com.ticketing.notification.event.BookingEvent;
import com.ticketing.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class BookingEventConsumer {

    private static final Logger LOG = LoggerFactory.getLogger(BookingEventConsumer.class);
    private final NotificationService notificationService;

    public BookingEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "booking-events", groupId = "notification-service", containerFactory = "kafkaListenerContainerFactory")
    public void consume(BookingEvent event) {
        try {
            LOG.info("Received BookingEvent: {}", event.getEventType());
            notificationService.processBookingEvent(event);
        } catch (Exception e) {
            LOG.error("Error processing event: {}", e.getMessage(), e);
        }
    }
}
