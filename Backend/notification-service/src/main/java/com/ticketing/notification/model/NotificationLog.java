package com.ticketing.notification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationLog {
    private UUID id;
    private String recipientEmail;
    private String recipientPhone;
    private NotificationType type;
    private String subject;
    private String body;
    private LocalDateTime sentAt;
    private String eventType;
}
