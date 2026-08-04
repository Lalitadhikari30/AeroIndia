package com.ticketing.booking.service;

import com.ticketing.booking.model.AddOnType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AddOnPricingService {

    public BigDecimal getAddOnPrice(AddOnType type) {
        switch (type) {
            case EXTRA_BAGGAGE:
                return new BigDecimal("1500.00");
            case MEAL_PREFERENCE:
                return new BigDecimal("500.00");
            case LOUNGE_ACCESS:
                return new BigDecimal("2000.00");
            case PRIORITY_BOARDING:
                return new BigDecimal("800.00");
            case TRAVEL_INSURANCE:
                return new BigDecimal("1200.00");
            default:
                return BigDecimal.ZERO;
        }
    }
}
