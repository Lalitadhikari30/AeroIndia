package com.ticketing.genai.config;

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
