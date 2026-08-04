package com.ticketing.genai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NaturalLanguageSearchResponse {
    private String originalQuery;
    private ParsedIntent interpretedIntent;
    private List<Map<String, Object>> flights;
    private String aiSummary;
}
