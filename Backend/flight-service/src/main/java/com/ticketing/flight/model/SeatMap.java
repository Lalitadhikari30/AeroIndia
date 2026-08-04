package com.ticketing.flight.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatMap {
    private int totalRows;
    private int seatsPerRow;
    private List<SeatClass> seatClasses;
    private List<Seat> seats;
}
