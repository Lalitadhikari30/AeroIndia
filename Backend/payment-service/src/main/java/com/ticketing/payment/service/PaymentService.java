package com.ticketing.payment.service;

import com.ticketing.payment.dto.GatewayResult;
import com.ticketing.payment.dto.PaymentRequest;
import com.ticketing.payment.dto.PaymentResponse;
import com.ticketing.payment.dto.RefundRequest;
import com.ticketing.payment.dto.RefundResponse;
import com.ticketing.payment.exception.PaymentNotFoundException;
import com.ticketing.payment.exception.PaymentProcessingException;
import com.ticketing.payment.exception.RefundNotAllowedException;
import com.ticketing.payment.model.Payment;
import com.ticketing.payment.model.PaymentStatus;
import com.ticketing.payment.model.Refund;
import com.ticketing.payment.model.RefundStatus;
import com.ticketing.payment.repository.PaymentRepository;
import com.ticketing.payment.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final MockPaymentGateway mockPaymentGateway;

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        // IDEMPOTENCY: Check if payment exists for this booking ID
        Optional<Payment> existingPayment = paymentRepository.findByBookingId(request.getBookingId());
        if (existingPayment.isPresent()) {
            log.info("Payment for booking {} already exists. Returning existing payment.", request.getBookingId());
            return mapToResponse(existingPayment.get());
        }

        log.info("Initiating payment for booking: {}", request.getBookingId());
        Payment payment = Payment.builder()
                .bookingId(request.getBookingId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .build();

        payment = paymentRepository.save(payment);

        GatewayResult result = mockPaymentGateway.processPayment(payment.getAmount(), payment.getPaymentMethod());

        if (result.isSuccess()) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setGatewayReference(result.getTransactionId());
            log.info("Payment {} processed successfully", payment.getId());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setGatewayReference(result.getTransactionId());
            payment.setFailureReason(result.getFailureReason());
            log.warn("Payment {} failed: {}", payment.getId(), result.getFailureReason());
            payment = paymentRepository.save(payment);
            throw new PaymentProcessingException("Payment failed: " + result.getFailureReason());
        }

        payment = paymentRepository.save(payment);
        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + id));
        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(String bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found for booking: " + bookingId));
        return mapToResponse(payment);
    }

    @Transactional
    public RefundResponse processRefund(UUID paymentId, RefundRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + paymentId));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new RefundNotAllowedException("Only SUCCESS payments can be refunded. Current status: " + payment.getStatus());
        }

        log.info("Processing refund for payment: {}", paymentId);
        
        Refund refund = Refund.builder()
                .payment(payment)
                .amount(payment.getAmount())
                .reason(request.getReason())
                .status(RefundStatus.PROCESSED)
                .processedAt(LocalDateTime.now())
                .build();

        refund = refundRepository.save(refund);

        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        log.info("Refund {} processed successfully for payment {}", refund.getId(), paymentId);

        return RefundResponse.builder()
                .id(refund.getId())
                .paymentId(payment.getId())
                .amount(refund.getAmount())
                .reason(refund.getReason())
                .status(refund.getStatus())
                .processedAt(refund.getProcessedAt())
                .build();
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBookingId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .gatewayReference(payment.getGatewayReference())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
