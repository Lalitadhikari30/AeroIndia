package com.ticketing.booking.dto;

import com.ticketing.booking.model.AddOnType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddOnResponse {
    private UUID id;
    private AddOnType type;
    private String description;
    private BigDecimal price;
}
