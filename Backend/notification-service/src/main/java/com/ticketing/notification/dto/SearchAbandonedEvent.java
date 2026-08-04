package com.ticketing.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchAbandonedEvent {
    private String passengerName;
    private String passengerEmail;
    private String fromCity;
    private String toCity;
    private String departureDate;
}
