package com.ticketing.booking.dto;

import com.ticketing.booking.model.AddOnType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddOnRequest {

    @NotNull(message = "Add-on type is required")
    private AddOnType type;

    private String description;
}
