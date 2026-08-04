package com.ticketing.booking.controller;

import com.ticketing.booking.dto.AddOnRequest;
import com.ticketing.booking.dto.BookingRequest;
import com.ticketing.booking.dto.BookingResponse;
import com.ticketing.booking.dto.WaitlistRequest;
import com.ticketing.booking.dto.WaitlistResponse;
import com.ticketing.booking.service.BookingService;
import com.ticketing.booking.service.WaitlistService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Booking Management")
public class BookingController {

    private final BookingService bookingService;
    private final WaitlistService waitlistService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@RequestHeader("X-User-Id") String userId,
                                                         @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/pnr/{pnr}")
    public ResponseEntity<BookingResponse> getBookingByPnr(@PathVariable String pnr) {
        return ResponseEntity.ok(bookingService.getBookingByPnr(pnr));
    }

    @GetMapping("/passenger/{passengerId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByPassenger(@PathVariable String passengerId) {
        return ResponseEntity.ok(bookingService.getBookingsByPassenger(passengerId));
    }

    @GetMapping("/flight/{flightId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByFlight(@PathVariable String flightId) {
        return ResponseEntity.ok(bookingService.getBookingsByFlight(flightId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@RequestHeader("X-User-Id") String userId,
                                                         @PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId));
    }

    @PostMapping("/{id}/addons")
    public ResponseEntity<BookingResponse> addAddOn(@PathVariable UUID id,
                                                    @Valid @RequestBody AddOnRequest request) {
        return ResponseEntity.ok(bookingService.addAddOn(id, request));
    }

    @PostMapping("/waitlist")
    public ResponseEntity<WaitlistResponse> addToWaitlist(@RequestHeader("X-User-Id") String userId,
                                                          @Valid @RequestBody WaitlistRequest request) {
        return ResponseEntity.ok(waitlistService.addToWaitlist(request, userId));
    }

    @GetMapping("/waitlist/{flightId}")
    public ResponseEntity<List<WaitlistResponse>> getWaitlistForFlight(@PathVariable String flightId) {
        return ResponseEntity.ok(waitlistService.getWaitlistForFlight(flightId));
    }
}
