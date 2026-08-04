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
public class DocumentIngestRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    private String category;
}
