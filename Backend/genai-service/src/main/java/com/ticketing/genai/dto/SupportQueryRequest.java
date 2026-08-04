package com.ticketing.genai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportQueryRequest {

    @NotBlank(message = "Query cannot be empty")
    private String query;

    private String conversationId;
}
