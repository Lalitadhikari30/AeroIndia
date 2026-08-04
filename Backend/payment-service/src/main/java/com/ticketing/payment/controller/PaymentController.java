package com.ticketing.payment.controller;

import com.ticketing.payment.dto.PaymentRequest;
import com.ticketing.payment.dto.PaymentResponse;
import com.ticketing.payment.dto.RefundRequest;
import com.ticketing.payment.dto.RefundResponse;
import com.ticketing.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Payment Processing", description = "Endpoints for payments and refunds")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Process a payment", description = "Initiate a new payment for a booking")
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID", description = "Fetch a payment by its unique ID")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get payment by booking ID", description = "Fetch a payment by the associated booking ID")
    public ResponseEntity<PaymentResponse> getPaymentByBookingId(@PathVariable String bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBookingId(bookingId));
    }

    @PostMapping("/{id}/refund")
    @Operation(summary = "Process a refund", description = "Refund a previously successful payment")
    public ResponseEntity<RefundResponse> processRefund(
            @PathVariable UUID id,
            @Valid @RequestBody RefundRequest request) {
        RefundResponse response = paymentService.processRefund(id, request);
        return ResponseEntity.ok(response);
    }
}
