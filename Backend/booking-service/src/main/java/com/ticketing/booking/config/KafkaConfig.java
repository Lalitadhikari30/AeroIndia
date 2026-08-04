package com.ticketing.booking.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
@ConditionalOnProperty(name = "spring.kafka.bootstrap-servers")
public class KafkaConfig {

    @Bean
    public NewTopic bookingEventsTopic() {
        return TopicBuilder.name("booking-events")
                .partitions(3)
                .replicas(3)
                .build();
    }

    @Bean
    public NewTopic bookingWaitlistTopic() {
        return TopicBuilder.name("booking-waitlist")
                .partitions(1)
                .replicas(3)
                .build();
    }
}
