package com.ticketing.genai.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "faq_embeddings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaqEmbedding {

    @Id
    private String id;

    @Column(nullable = false)
    private String category;

    private String subcategory;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String sourceUrl;

    @Column(columnDefinition = "TEXT")
    private String embeddingJson;
}
