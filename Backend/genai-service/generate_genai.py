import os

base_dir = r"c:\Users\Fam\Desktop\Ticketing App\Backend\genai-service"

files = {
    "pom.xml": """<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.13</version>
        <relativePath/>
    </parent>
    <groupId>com.ticketing</groupId>
    <artifactId>genai-service</artifactId>
    <version>1.0.0</version>
    <name>GenAI Assistant Service</name>
    <properties>
        <java.version>21</java.version>
        <spring-cloud.version>2024.0.3</spring-cloud.version>
    </properties>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.8.17</version>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
""",
    "src/main/resources/application.yml": """server:
  port: 8086
  servlet:
    context-path: /api/genai

spring:
  application:
    name: genai-service
  datasource:
    url: jdbc:postgresql://localhost:5432/ticketing_genai
    username: postgres
    password: "Lalit9968@"
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true

genai:
  anthropic:
    api-key: ${ANTHROPIC_API_KEY:stub}
    model: claude-sonnet-4-20250514
  stub-mode: true

springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html

feign:
  client:
    config:
      default:
        connect-timeout: 5000
        read-timeout: 5000
""",
    "src/main/java/com/ticketing/genai/GenAiServiceApplication.java": """package com.ticketing.genai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class GenAiServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GenAiServiceApplication.class, args);
    }
}
""",
    "src/main/java/com/ticketing/genai/dto/NaturalLanguageSearchRequest.java": """package com.ticketing.genai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NaturalLanguageSearchRequest {
    @NotBlank
    private String query;
}
""",
    "src/main/java/com/ticketing/genai/dto/NaturalLanguageSearchResponse.java": """package com.ticketing.genai.dto;

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
""",
    "src/main/java/com/ticketing/genai/dto/ParsedIntent.java": """package com.ticketing.genai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParsedIntent {
    private String departureAirport;
    private String arrivalAirport;
    private String date;
    private String timePreference;
    private String sortBy;
    private BigDecimal maxPrice;
}
""",
    "src/main/java/com/ticketing/genai/dto/ChatRequest.java": """package com.ticketing.genai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    @NotBlank
    private String message;
    private String conversationId;
}
""",
    "src/main/java/com/ticketing/genai/dto/ChatResponse.java": """package com.ticketing.genai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String response;
    private List<String> sources;
    private String conversationId;
}
""",
    "src/main/java/com/ticketing/genai/dto/ItineraryRequest.java": """package com.ticketing.genai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryRequest {
    @NotBlank
    private String bookingId;
}
""",
    "src/main/java/com/ticketing/genai/dto/ItineraryResponse.java": """package com.ticketing.genai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryResponse {
    private String bookingId;
    private String itinerary;
    private LocalDateTime generatedAt;
}
""",
    "src/main/java/com/ticketing/genai/dto/DocumentIngestRequest.java": """package com.ticketing.genai.dto;

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
""",
    "src/main/java/com/ticketing/genai/dto/ErrorResponse.java": """package com.ticketing.genai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String message;
    private String details;
    private LocalDateTime timestamp;
}
""",
    "src/main/java/com/ticketing/genai/model/PolicyDocument.java": """package com.ticketing.genai.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "policy_documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private String category;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
""",
    "src/main/java/com/ticketing/genai/repository/PolicyDocumentRepository.java": """package com.ticketing.genai.repository;

import com.ticketing.genai.model.PolicyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PolicyDocumentRepository extends JpaRepository<PolicyDocument, UUID> {
    List<PolicyDocument> findByCategory(String category);
    List<PolicyDocument> findByTitleContainingIgnoreCase(String keyword);
}
""",
    "src/main/java/com/ticketing/genai/client/FlightServiceClient.java": """package com.ticketing.genai.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "flight-service", path = "/api/flights")
public interface FlightServiceClient {
    @GetMapping("/search")
    List<Map<String, Object>> searchFlights(@RequestParam("from") String from,
                                            @RequestParam("to") String to,
                                            @RequestParam("date") String date);
}
""",
    "src/main/java/com/ticketing/genai/service/IntentParserService.java": """package com.ticketing.genai.service;

import com.ticketing.genai.dto.ParsedIntent;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class IntentParserService {

    private static final Map<String, String> CITY_TO_CODE = new HashMap<>();
    static {
        CITY_TO_CODE.put("delhi", "DEL");
        CITY_TO_CODE.put("mumbai", "BOM");
        CITY_TO_CODE.put("bangalore", "BLR");
        CITY_TO_CODE.put("chennai", "MAA");
        CITY_TO_CODE.put("kolkata", "CCU");
        CITY_TO_CODE.put("hyderabad", "HYD");
        CITY_TO_CODE.put("goa", "GOI");
        CITY_TO_CODE.put("kochi", "COK");
        CITY_TO_CODE.put("ahmedabad", "AMD");
        CITY_TO_CODE.put("jaipur", "JAI");
    }

    public ParsedIntent parseIntent(String naturalLanguageQuery) {
        String lowerQuery = naturalLanguageQuery.toLowerCase();
        ParsedIntent intent = new ParsedIntent();
        
        // Find cities
        for (Map.Entry<String, String> entry : CITY_TO_CODE.entrySet()) {
            if (lowerQuery.contains(entry.getKey())) {
                if (lowerQuery.indexOf("from " + entry.getKey()) != -1 || lowerQuery.indexOf(entry.getKey()) < lowerQuery.indexOf(" to ")) {
                    if (intent.getDepartureAirport() == null) intent.setDepartureAirport(entry.getValue());
                } else if (lowerQuery.indexOf("to " + entry.getKey()) != -1) {
                    intent.setArrivalAirport(entry.getValue());
                } else {
                    if (intent.getDepartureAirport() == null) {
                        intent.setDepartureAirport(entry.getValue());
                    } else if (intent.getArrivalAirport() == null) {
                        intent.setArrivalAirport(entry.getValue());
                    }
                }
            }
        }
        
        // Time preference
        if (lowerQuery.contains("morning")) intent.setTimePreference("morning");
        else if (lowerQuery.contains("afternoon")) intent.setTimePreference("afternoon");
        else if (lowerQuery.contains("evening")) intent.setTimePreference("evening");
        else if (lowerQuery.contains("night")) intent.setTimePreference("night");
        
        // Sorting
        if (lowerQuery.contains("cheapest")) intent.setSortBy("price");
        else if (lowerQuery.contains("fastest")) intent.setSortBy("duration");
        else if (lowerQuery.contains("earliest")) intent.setSortBy("departureTime");
        
        // Default date logic for stub
        intent.setDate("2026-08-01");
        
        return intent;
    }
}
""",
    "src/main/java/com/ticketing/genai/service/FlightSearchAiService.java": """package com.ticketing.genai.service;

import com.ticketing.genai.client.FlightServiceClient;
import com.ticketing.genai.dto.NaturalLanguageSearchRequest;
import com.ticketing.genai.dto.NaturalLanguageSearchResponse;
import com.ticketing.genai.dto.ParsedIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FlightSearchAiService {

    private final IntentParserService intentParserService;
    private final FlightServiceClient flightServiceClient;

    public NaturalLanguageSearchResponse searchFlights(NaturalLanguageSearchRequest request) {
        ParsedIntent intent = intentParserService.parseIntent(request.getQuery());
        
        List<Map<String, Object>> flights;
        try {
            flights = flightServiceClient.searchFlights(
                intent.getDepartureAirport() != null ? intent.getDepartureAirport() : "DEL",
                intent.getArrivalAirport() != null ? intent.getArrivalAirport() : "BOM",
                intent.getDate() != null ? intent.getDate() : "2026-08-01"
            );
        } catch (Exception e) {
            // Fallback for stub if feign client fails
            flights = new ArrayList<>();
        }
        
        String summary = String.format("Found %d flights from %s to %s on %s.", 
            flights.size(), 
            intent.getDepartureAirport(), 
            intent.getArrivalAirport(), 
            intent.getDate());
            
        return NaturalLanguageSearchResponse.builder()
                .originalQuery(request.getQuery())
                .interpretedIntent(intent)
                .flights(flights)
                .aiSummary(summary)
                .build();
    }
}
""",
    "src/main/java/com/ticketing/genai/service/ChatService.java": """package com.ticketing.genai.service;

import com.ticketing.genai.dto.ChatRequest;
import com.ticketing.genai.dto.ChatResponse;
import com.ticketing.genai.model.PolicyDocument;
import com.ticketing.genai.repository.PolicyDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final PolicyDocumentRepository documentRepository;
    private final Map<String, List<String>> conversationHistory = new ConcurrentHashMap<>();

    public ChatResponse chat(ChatRequest request) {
        String convId = request.getConversationId();
        if (convId == null || convId.isEmpty()) {
            convId = UUID.randomUUID().toString();
        }
        
        conversationHistory.putIfAbsent(convId, new ArrayList<>());
        conversationHistory.get(convId).add("User: " + request.getMessage());
        
        String lowerMessage = request.getMessage().toLowerCase();
        List<PolicyDocument> docs = new ArrayList<>();
        
        if (lowerMessage.contains("baggage") || lowerMessage.contains("luggage") || lowerMessage.contains("bag")) {
            docs.addAll(documentRepository.findByCategory("baggage-policy"));
        } else if (lowerMessage.contains("refund") || lowerMessage.contains("cancel")) {
            docs.addAll(documentRepository.findByCategory("refund-policy"));
        } else if (lowerMessage.contains("seat")) {
            docs.addAll(documentRepository.findByCategory("seat-policy"));
        } else if (lowerMessage.contains("lounge")) {
            docs.addAll(documentRepository.findByCategory("lounge-policy"));
        } else if (lowerMessage.contains("delay") || lowerMessage.contains("compensation")) {
            docs.addAll(documentRepository.findByCategory("delay-policy"));
        }
        
        String responseText;
        List<String> sources = new ArrayList<>();
        
        if (!docs.isEmpty()) {
            PolicyDocument doc = docs.get(0);
            responseText = "Based on our policies: " + doc.getContent();
            sources.add(doc.getTitle());
        } else {
            responseText = "I can help with flight bookings, baggage policies, refund policies, and more. Please be more specific.";
        }
        
        conversationHistory.get(convId).add("AI: " + responseText);
        
        return ChatResponse.builder()
                .response(responseText)
                .sources(sources)
                .conversationId(convId)
                .build();
    }
}
""",
    "src/main/java/com/ticketing/genai/service/ItineraryService.java": """package com.ticketing.genai.service;

import com.ticketing.genai.dto.ItineraryResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ItineraryService {

    public ItineraryResponse generateItinerary(String bookingId) {
        String markdown = "# ✈ Your Travel Itinerary\\n\\n" +
                "## Booking Reference: " + bookingId + "\\n\\n" +
                "### Flight Details\\n" +
                "- **Flight**: AI-101\\n" +
                "- **Route**: Delhi (DEL) → Mumbai (BOM)\\n" +
                "- **Date**: 2026-08-01\\n" +
                "- **Departure**: 18:00 IST\\n" +
                "- **Arrival**: 20:15 IST\\n" +
                "- **Seat**: 12A (Economy)\\n\\n" +
                "### Pre-Flight Checklist\\n" +
                "- [ ] Web check-in (opens 48 hours before departure)\\n" +
                "- [ ] Download boarding pass\\n" +
                "- [ ] Carry valid photo ID\\n\\n" +
                "### Airport Information\\n" +
                "**Departure**: Terminal 3, Indira Gandhi International Airport\\n" +
                "- Recommended arrival: 2 hours before departure\\n\\n" +
                "*Generated by AAI Ticketing AI Assistant*";
                
        return ItineraryResponse.builder()
                .bookingId(bookingId)
                .itinerary(markdown)
                .generatedAt(LocalDateTime.now())
                .build();
    }
}
""",
    "src/main/java/com/ticketing/genai/controller/GenAiController.java": """package com.ticketing.genai.controller;

import com.ticketing.genai.dto.ChatRequest;
import com.ticketing.genai.dto.ChatResponse;
import com.ticketing.genai.dto.DocumentIngestRequest;
import com.ticketing.genai.dto.ItineraryRequest;
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
@CrossOrigin
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
""",
    "src/main/java/com/ticketing/genai/config/DataInitializer.java": """package com.ticketing.genai.config;

import com.ticketing.genai.model.PolicyDocument;
import com.ticketing.genai.repository.PolicyDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final PolicyDocumentRepository documentRepository;

    @Override
    public void run(String... args) {
        if (documentRepository.count() == 0) {
            List<PolicyDocument> docs = List.of(
                PolicyDocument.builder()
                    .title("Domestic Baggage Allowance")
                    .category("baggage-policy")
                    .content("Each passenger is allowed one cabin bag (7kg) and one check-in bag (15kg for economy, 25kg for business). Additional baggage can be purchased at ₹500 per 5kg.")
                    .build(),
                PolicyDocument.builder()
                    .title("Cancellation and Refund Policy")
                    .category("refund-policy")
                    .content("Cancellations made 24+ hours before departure receive a full refund minus ₹500 processing fee. Cancellations within 24 hours receive 50% refund. No-shows are non-refundable.")
                    .build(),
                PolicyDocument.builder()
                    .title("Seat Selection Policy")
                    .category("seat-policy")
                    .content("Free seat selection is available during web check-in. Preferred seats (extra legroom, window/aisle) can be pre-booked for ₹200-₹800 depending on the seat type.")
                    .build(),
                PolicyDocument.builder()
                    .title("Lounge Access")
                    .category("lounge-policy")
                    .content("Complimentary lounge access for Business class passengers. Economy passengers can purchase lounge access for ₹2000 per person. Lounge facilities include refreshments, Wi-Fi, and shower rooms.")
                    .build(),
                PolicyDocument.builder()
                    .title("Flight Delay and Compensation")
                    .category("delay-policy")
                    .content("For delays over 2 hours: complimentary meals provided. Over 4 hours: hotel accommodation arranged. Over 6 hours: option to rebook on next available flight or full refund.")
                    .build()
            );
            documentRepository.saveAll(docs);
        }
    }
}
""",
    "src/main/java/com/ticketing/genai/exception/GlobalExceptionHandler.java": """package com.ticketing.genai.exception;

import com.ticketing.genai.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DocumentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleDocumentNotFoundException(DocumentNotFoundException ex, WebRequest request) {
        ErrorResponse errorDetails = ErrorResponse.builder()
                .message(ex.getMessage())
                .details(request.getDescription(false))
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(errorDetails, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, WebRequest request) {
        ErrorResponse errorDetails = ErrorResponse.builder()
                .message("Validation Failed")
                .details(ex.getBindingResult().toString())
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
        ErrorResponse errorDetails = ErrorResponse.builder()
                .message(ex.getMessage())
                .details(request.getDescription(false))
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
""",
    "src/main/java/com/ticketing/genai/exception/DocumentNotFoundException.java": """package com.ticketing.genai.exception;

public class DocumentNotFoundException extends RuntimeException {
    public DocumentNotFoundException(String message) {
        super(message);
    }
}
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("All files created successfully!")
