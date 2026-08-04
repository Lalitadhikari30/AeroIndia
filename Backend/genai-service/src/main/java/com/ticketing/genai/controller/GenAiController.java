package com.ticketing.genai.controller;

import com.ticketing.genai.dto.ChatRequest;
import com.ticketing.genai.dto.ChatResponse;
import com.ticketing.genai.dto.DocumentIngestRequest;
import com.ticketing.genai.dto.ItineraryResponse;
import com.ticketing.genai.dto.NaturalLanguageSearchRequest;
import com.ticketing.genai.dto.NaturalLanguageSearchResponse;
import com.ticketing.genai.model.PolicyDocument;
import com.ticketing.genai.repository.PolicyDocumentRepository;
import com.ticketing.genai.service.ChatService;
import com.ticketing.genai.service.FlightSearchAiService;
import com.ticketing.genai.service.ItineraryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "GenAI Assistant")
public class GenAiController {

    private final FlightSearchAiService flightSearchAiService;
    private final ChatService chatService;
    private final ItineraryService itineraryService;
    private final PolicyDocumentRepository documentRepository;

    @PostMapping("/search")
    public ResponseEntity<NaturalLanguageSearchResponse> searchFlights(@Valid @RequestBody NaturalLanguageSearchRequest request) {
        return ResponseEntity.ok(flightSearchAiService.searchFlights(request));
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.chat(request));
    }

    @PostMapping("/itinerary/{bookingId}")
    public ResponseEntity<ItineraryResponse> generateItinerary(@PathVariable String bookingId) {
        return ResponseEntity.ok(itineraryService.generateItinerary(bookingId));
    }

    @PostMapping("/documents/ingest")
    public ResponseEntity<PolicyDocument> ingestDocument(@Valid @RequestBody DocumentIngestRequest request) {
        PolicyDocument doc = PolicyDocument.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .build();
        return ResponseEntity.ok(documentRepository.save(doc));
    }

    @GetMapping("/documents")
    public ResponseEntity<List<PolicyDocument>> getAllDocuments() {
        return ResponseEntity.ok(documentRepository.findAll());
    }

    @GetMapping("/documents/{category}")
    public ResponseEntity<List<PolicyDocument>> getDocumentsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(documentRepository.findByCategory(category));
    }
}
