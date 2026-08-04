package com.ticketing.notification.service;

import com.ticketing.notification.dto.NotificationStats;
import com.ticketing.notification.event.BookingEvent;
import com.ticketing.notification.model.NotificationLog;
import com.ticketing.notification.model.NotificationType;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final EmailService emailService;
    private final SmsService smsService;
    private final List<NotificationLog> notificationLogs = Collections.synchronizedList(new ArrayList<>());

    public NotificationService(EmailService emailService, SmsService smsService) {
        this.emailService = emailService;
        this.smsService = smsService;
    }

    public void processBookingEvent(BookingEvent event) {
        if (event.getEventType() == null) {
            return;
        }
        
        switch (event.getEventType()) {
            case "BOOKING_CONFIRMED":
                addLog(emailService.sendBookingConfirmation(event));
                addLog(smsService.sendBookingConfirmationSms(event));
                break;
            case "BOOKING_CANCELLED":
                addLog(emailService.sendCancellationNotice(event));
                addLog(smsService.sendCancellationSms(event));
                break;
            case "WAITLIST_PROMOTED":
                addLog(emailService.sendWaitlistPromotion(event));
                addLog(smsService.sendWaitlistPromotionSms(event));
                break;
            case "PAYMENT_SUCCESSFUL":
                addLog(emailService.sendPaymentReceipt(event));
                break;
            default:
                // Other event types might not require notifications, or can be logged
                break;
        }
    }

    private void addLog(NotificationLog log) {
        if (log != null) {
            notificationLogs.add(log);
            // keep the list manageable in memory
            if (notificationLogs.size() > 1000) {
                notificationLogs.remove(0);
            }
        }
    }

    public List<NotificationLog> getRecentNotifications() {
        int size = notificationLogs.size();
        int limit = Math.min(size, 50);
        List<NotificationLog> reversed = new ArrayList<>(notificationLogs);
        Collections.reverse(reversed);
        return reversed.subList(0, limit);
    }

    public NotificationStats getNotificationStats() {
        long totalSent = notificationLogs.size();
        long emailsSent = notificationLogs.stream().filter(n -> n.getType() == NotificationType.EMAIL).count();
        long smsSent = notificationLogs.stream().filter(n -> n.getType() == NotificationType.SMS).count();
        
        Map<String, Long> byEventType = notificationLogs.stream()
                .filter(n -> n.getEventType() != null)
                .collect(Collectors.groupingBy(NotificationLog::getEventType, Collectors.counting()));
                
        return NotificationStats.builder()
                .totalSent(totalSent)
                .emailsSent(emailsSent)
                .smsSent(smsSent)
                .byEventType(byEventType)
                .build();
    }
}
