package com.ticketing.payment.service;

import com.ticketing.payment.dto.GatewayResult;
import com.ticketing.payment.model.PaymentMethod;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Service
public class MockPaymentGateway {

    private final int successRate;
    private final int minLatencyMs;
    private final int maxLatencyMs;
    private final Random random;
    private final List<String> failureReasons = List.of(
            "Insufficient funds",
            "Card declined",
            "Network error",
            "Bank timeout"
    );

    public MockPaymentGateway(
            @Value("${payment.gateway.success-rate:90}") int successRate,
            @Value("${payment.gateway.min-latency-ms:200}") int minLatencyMs,
            @Value("${payment.gateway.max-latency-ms:800}") int maxLatencyMs) {
        this.successRate = successRate;
        this.minLatencyMs = minLatencyMs;
        this.maxLatencyMs = maxLatencyMs;
        this.random = new Random();
    }

    public GatewayResult processPayment(BigDecimal amount, PaymentMethod method) {
        log.info("Processing payment via mock gateway. Amount: {}, Method: {}", amount, method);

        simulateLatency();

        boolean isSuccess = random.nextInt(100) < successRate;
        String transactionId = UUID.randomUUID().toString();

        if (isSuccess) {
            log.info("Payment successful. Transaction ID: {}", transactionId);
            return GatewayResult.builder()
                    .success(true)
                    .transactionId(transactionId)
                    .build();
        } else {
            String reason = failureReasons.get(random.nextInt(failureReasons.size()));
            log.warn("Payment failed. Reason: {}", reason);
            return GatewayResult.builder()
                    .success(false)
                    .transactionId(transactionId)
                    .failureReason(reason)
                    .build();
        }
    }

    private void simulateLatency() {
        try {
            int latency = minLatencyMs + random.nextInt(maxLatencyMs - minLatencyMs + 1);
            Thread.sleep(latency);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
