package com.ticketing.payment.dto;

import com.ticketing.payment.model.RefundStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponse {
    private UUID id;
    private UUID paymentId;
    private BigDecimal amount;
    private String reason;
    private RefundStatus status;
    private LocalDateTime processedAt;
}
