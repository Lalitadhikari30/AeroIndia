package com.ticketing.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationStats {
    private long totalSent;
    private Map<String, Long> byEventType;
    private long emailsSent;
    private long smsSent;
}
