package com.ticketing.genai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportQueryResponse {

    private String answer;
    private List<String> sources;
    private Double confidenceScore;
    private String conversationId;
}
