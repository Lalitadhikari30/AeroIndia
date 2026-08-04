package com.ticketing.genai.model;

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
