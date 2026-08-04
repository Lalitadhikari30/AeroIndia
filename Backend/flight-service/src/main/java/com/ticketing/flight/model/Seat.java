package com.ticketing.flight.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Seat {
    private String seatNumber;
    private int row;
    private String column;
    private String seatClass;
    private boolean available;
    private BigDecimal price;
}
