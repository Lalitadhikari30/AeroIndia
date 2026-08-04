package com.ticketing.flight.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatClass {
    private String className;
    private int fromRow;
    private int toRow;
    private double priceMultiplier;
}
