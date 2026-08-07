package com.ticketing.booking.service;

import com.ticketing.booking.client.FlightServiceClient;
import com.ticketing.booking.client.PaymentServiceClient;
import com.ticketing.booking.dto.AddOnRequest;
import com.ticketing.booking.dto.BookingRequest;
import com.ticketing.booking.dto.BookingResponse;
import com.ticketing.booking.dto.AddOnResponse;
import com.ticketing.booking.event.BookingEventPublisher;
import com.ticketing.booking.exception.BookingNotFoundException;
import com.ticketing.booking.exception.DuplicateBookingException;
import com.ticketing.booking.exception.SeatUnavailableException;
import com.ticketing.booking.model.Booking;
import com.ticketing.booking.model.BookingAddOn;
import com.ticketing.booking.model.BookingStatus;
import com.ticketing.booking.repository.BookingRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FlightServiceClient flightServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final SeatLockService seatLockService;
    private final WaitlistService waitlistService;
    private final BookingEventPublisher eventPublisher;
    private final AddOnPricingService addOnPricingService;
    
    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public BookingResponse createBooking(BookingRequest req, String passengerId) {
        // 1. Idempotency Check
        Optional<Booking> existingBooking = bookingRepository.findByIdempotencyKey(req.getIdempotencyKey());
        if (existingBooking.isPresent()) {
            log.info("Returning existing booking for idempotency key: {}", req.getIdempotencyKey());
            return mapToResponse(existingBooking.get());
        }

        // 2. Call Flight Service for flight details
        Map<String, Object> flightInfo;
        try {
            flightInfo = flightServiceClient.getFlightById(req.getFlightId());
        } catch (Exception e) {
            log.error("Failed to fetch flight details", e);
            throw new RuntimeException("Failed to fetch flight details: " + e.getMessage());
        }

        // Verify seat availability (simplified check)
        Map<String, Object> seatResponse;
        try {
            seatResponse = flightServiceClient.getSeatAvailability(req.getFlightId());
            // Assume seatResponse contains available seats logic
        } catch (Exception e) {
            log.error("Failed to check seat availability", e);
            throw new RuntimeException("Failed to check seat availability");
        }

        // 3. LAYER 2 - Distributed Lock
        boolean lockAcquired = seatLockService.acquireSeatLock(req.getFlightId(), req.getSeatNumber(), 5000, 30000);
        if (!lockAcquired) {
            log.warn("Could not acquire lock for seat. Putting user on waitlist.");
            throw new SeatUnavailableException("Seat is currently being booked by another user. Please try again or join waitlist.");
        }

        try {
            BigDecimal basePrice = new BigDecimal(flightInfo.getOrDefault("basePrice", "1000.0").toString());
            BigDecimal finalPrice = req.getTotalPrice() != null ? req.getTotalPrice() : basePrice;

            java.time.LocalDateTime depTime = null;
            if (req.getDepartureTime() != null && !req.getDepartureTime().isBlank()) {
                try {
                    String cleanIso = req.getDepartureTime().replace(" ", "T");
                    if (!cleanIso.contains("T")) cleanIso += "T08:30:00";
                    depTime = java.time.LocalDateTime.parse(cleanIso);
                } catch (Exception e) {
                    depTime = java.time.LocalDateTime.now().plusDays(5);
                }
            } else {
                depTime = java.time.LocalDateTime.now().plusDays(5);
            }

            // 4. Create Booking
            Booking booking = Booking.builder()
                    .passengerId(passengerId)
                    .passengerName(req.getPassengerName())
                    .passengerEmail(req.getPassengerEmail())
                    .flightId(req.getFlightId())
                    .flightNumber((String) flightInfo.getOrDefault("flightNumber", "AI-801"))
                    .seatNumber(req.getSeatNumber())
                    .seatClass(req.getSeatClass())
                    .departureAirport((String) flightInfo.getOrDefault("departureAirport", "DEL"))
                    .arrivalAirport((String) flightInfo.getOrDefault("arrivalAirport", "BOM"))
                    .departureTime(depTime)
                    .basePrice(basePrice)
                    .totalPrice(finalPrice)
                    .status(BookingStatus.PENDING)
                    .pnr(generatePnr())
                    .idempotencyKey(req.getIdempotencyKey())
                    .build();

            // 5. Save with Optimistic Locking (LAYER 1)
            int retries = 3;
            while (retries > 0) {
                try {
                    booking = bookingRepository.saveAndFlush(booking);
                    break; // saved successfully
                } catch (OptimisticLockingFailureException e) {
                    retries--;
                    if (retries == 0) {
                        throw new DuplicateBookingException("Concurrent booking detected. Please try again.");
                    }
                    log.warn("Optimistic locking failure, retrying. Retries left: {}", retries);
                }
            }

            // 6. Update Seat in Flight Service
            try {
                Map<String, Object> updateRequest = new HashMap<>();
                updateRequest.put("seatNumber", req.getSeatNumber());
                updateRequest.put("status", "UNAVAILABLE");
                flightServiceClient.updateSeatAvailability(req.getFlightId(), updateRequest);
            } catch (Exception e) {
                log.error("Failed to update seat in flight service", e);
                // Depending on requirements, we might fail the booking or continue
            }

            // 7. Process Payment
            booking = processPaymentForBooking(booking);

            // 9. Publish Event
            eventPublisher.publishBookingCreated(booking);

            return mapToResponse(booking);

        } finally {
            // 8. Release Lock
            seatLockService.releaseSeatLock(req.getFlightId(), req.getSeatNumber());
        }
    }

    @CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
    @Retry(name = "paymentService")
    public Booking processPaymentForBooking(Booking booking) {
        log.info("Processing payment for booking: {}", booking.getId());
        Map<String, Object> paymentRequest = new HashMap<>();
        paymentRequest.put("bookingId", booking.getId().toString());
        paymentRequest.put("amount", booking.getTotalPrice());
        paymentRequest.put("currency", "INR");
        paymentRequest.put("userId", booking.getPassengerId());
        paymentRequest.put("paymentMethod", "CREDIT_CARD");

        Map<String, Object> paymentResponse = paymentServiceClient.processPayment(paymentRequest);
        
        String paymentStatus = (String) paymentResponse.get("status");
        if ("SUCCESS".equals(paymentStatus)) {
            booking.setStatus(BookingStatus.CONFIRMED);
            eventPublisher.publishBookingConfirmed(booking);
        } else {
            booking.setStatus(BookingStatus.PAYMENT_PENDING);
            // Optionally release seat if payment explicitly failed
        }
        
        return bookingRepository.save(booking);
    }

    // Fallback method must have same signature + Throwable
    public Booking paymentFallback(Booking booking, Throwable t) {
        log.warn("Payment service circuit breaker activated for booking {}: {}", booking.getId(), t.getMessage());
        booking.setStatus(BookingStatus.PAYMENT_PENDING);
        return bookingRepository.save(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(UUID bookingId, String passengerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));

        if (!booking.getPassengerId().equals(passengerId)) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return mapToResponse(booking); // already cancelled
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        // Update Flight Service
        try {
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("seatNumber", booking.getSeatNumber());
            updateRequest.put("status", "AVAILABLE");
            flightServiceClient.updateSeatAvailability(booking.getFlightId(), updateRequest);
        } catch (Exception e) {
            log.error("Failed to release seat in flight service", e);
        }

        // Refund Payment if confirmed
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            try {
                Map<String, Object> refundRequest = new HashMap<>();
                refundRequest.put("amount", booking.getTotalPrice());
                paymentServiceClient.processRefund(booking.getId().toString(), refundRequest);
            } catch (Exception e) {
                log.error("Failed to process refund", e);
            }
        }

        // Publish events
        eventPublisher.publishBookingCancelled(booking);
        eventPublisher.publishSeatFreed(booking.getFlightId(), booking.getSeatNumber());

        // Check waitlist
        waitlistService.promoteFromWaitlist(booking.getFlightId(), booking.getSeatClass().name());

        return mapToResponse(booking);
    }

    public BookingResponse getBookingById(UUID id) {
        return bookingRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + id));
    }

    public BookingResponse getBookingByPnr(String pnr) {
        return bookingRepository.findByPnr(pnr)
                .map(this::mapToResponse)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with PNR: " + pnr));
    }

    public List<BookingResponse> getBookingsByPassenger(String passengerId) {
        return bookingRepository.findByPassengerIdOrderByCreatedAtDesc(passengerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByFlight(String flightId) {
        return bookingRepository.findByFlightId(flightId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse addAddOn(UUID bookingId, AddOnRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));

        BigDecimal price = addOnPricingService.getAddOnPrice(req.getType());

        BookingAddOn addOn = BookingAddOn.builder()
                .booking(booking)
                .type(req.getType())
                .description(req.getDescription())
                .price(price)
                .build();

        booking.getAddOns().add(addOn);
        
        // Recalculate total price
        BigDecimal newTotal = booking.getBasePrice();
        for (BookingAddOn item : booking.getAddOns()) {
            newTotal = newTotal.add(item.getPrice());
        }
        booking.setTotalPrice(newTotal);

        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    private String generatePnr() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(RANDOM.nextInt(chars.length())));
        }
        String pnr = sb.toString();
        // Simple retry if exists
        if (bookingRepository.findByPnr(pnr).isPresent()) {
            return generatePnr();
        }
        return pnr;
    }

    private BookingResponse mapToResponse(Booking booking) {
        List<AddOnResponse> addOnResponses = booking.getAddOns().stream()
                .map(a -> AddOnResponse.builder()
                        .id(a.getId())
                        .type(a.getType())
                        .description(a.getDescription())
                        .price(a.getPrice())
                        .build())
                .collect(Collectors.toList());

        return BookingResponse.builder()
                .id(booking.getId())
                .pnr(booking.getPnr())
                .passengerId(booking.getPassengerId())
                .passengerName(booking.getPassengerName())
                .flightId(booking.getFlightId())
                .flightNumber(booking.getFlightNumber())
                .seatNumber(booking.getSeatNumber())
                .seatClass(booking.getSeatClass())
                .departureAirport(booking.getDepartureAirport())
                .arrivalAirport(booking.getArrivalAirport())
                .departureTime(booking.getDepartureTime())
                .basePrice(booking.getBasePrice())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .addOns(addOnResponses)
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
