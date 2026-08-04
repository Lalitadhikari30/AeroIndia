package com.ticketing.flight.service;

import com.ticketing.flight.model.Flight;
import com.ticketing.flight.model.SeatClass;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class PricingService {

    public BigDecimal calculateDynamicPrice(Flight flight, String seatClassName) {
        if (flight.getTotalSeats() == 0) return flight.getBasePrice();
        
        double occupancyPercent = (double) (flight.getTotalSeats() - flight.getAvailableSeats()) / flight.getTotalSeats();
        double occupancyMultiplier = getPriceMultiplier(occupancyPercent);
        
        double classMultiplier = 1.0;
        if (flight.getSeatMap() != null && flight.getSeatMap().getSeatClasses() != null) {
            for (SeatClass sc : flight.getSeatMap().getSeatClasses()) {
                if (sc.getClassName() != null && sc.getClassName().equalsIgnoreCase(seatClassName)) {
                    classMultiplier = sc.getPriceMultiplier();
                    break;
                }
            }
        }
        
        BigDecimal price = flight.getBasePrice()
                .multiply(BigDecimal.valueOf(occupancyMultiplier))
                .multiply(BigDecimal.valueOf(classMultiplier));
                
        return price.setScale(2, RoundingMode.HALF_UP);
    }

    public double getPriceMultiplier(double occupancyPercent) {
        if (occupancyPercent < 0.50) {
            return 1.0;
        } else if (occupancyPercent < 0.75) {
            return 1.3;
        } else if (occupancyPercent < 0.90) {
            return 1.6;
        } else {
            return 2.0;
        }
    }
}
