package com.ticketing.flight.controller;

import com.ticketing.flight.dto.*;
import com.ticketing.flight.model.Airport;
import com.ticketing.flight.model.Flight;
import com.ticketing.flight.service.FlightService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Flight Management", description = "APIs for flight search, schedule, and seating")
public class FlightController {

    private final FlightService flightService;

    @Operation(summary = "Search for flights")
    @GetMapping("/search")
    public ResponseEntity<FlightSearchResponse> searchFlights(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "1") int passengers,
            @RequestParam(required = false) String seatClass) {
        
        FlightSearchRequest req = FlightSearchRequest.builder()
                .departureAirport(from)
                .arrivalAirport(to)
                .departureDate(date)
                .passengers(passengers)
                .seatClass(seatClass)
                .build();
                
        return ResponseEntity.ok(flightService.searchFlights(req));
    }

    @Operation(summary = "Get flight by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Flight> getFlightById(@PathVariable String id) {
        return ResponseEntity.ok(flightService.getFlightById(id));
    }

    @Operation(summary = "Get seat availability for a flight")
    @GetMapping("/{id}/seats")
    public ResponseEntity<SeatAvailabilityResponse> getSeatAvailability(@PathVariable String id) {
        return ResponseEntity.ok(flightService.getSeatAvailability(id));
    }

    @Operation(summary = "Get all airports")
    @GetMapping("/airports")
    public ResponseEntity<List<Airport>> getAllAirports() {
        return ResponseEntity.ok(flightService.getAllAirports());
    }

    @Operation(summary = "Create a new flight (Admin only)")
    @PostMapping
    public ResponseEntity<Flight> createFlight(
            @RequestHeader(value = "X-User-Role", defaultValue = "USER") String role,
            @Valid @RequestBody FlightCreateRequest req) {
        
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return new ResponseEntity<>(flightService.createFlight(req), HttpStatus.CREATED);
    }

    @Operation(summary = "Update seat availability (Internal use)")
    @PutMapping("/{id}/seats")
    public ResponseEntity<Flight> updateSeatAvailability(
            @PathVariable String id,
            @Valid @RequestBody SeatUpdateRequest req) {
        return ResponseEntity.ok(flightService.updateSeatAvailability(id, req));
    }

    @Operation(summary = "Get all flights")
    @GetMapping
    public ResponseEntity<List<Flight>> getAllFlights() {
        return ResponseEntity.ok(flightService.getAllFlights());
    }
}
