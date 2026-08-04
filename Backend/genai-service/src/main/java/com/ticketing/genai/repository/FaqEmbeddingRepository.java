package com.ticketing.genai.repository;

import com.ticketing.genai.model.FaqEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqEmbeddingRepository extends JpaRepository<FaqEmbedding, String> {

    List<FaqEmbedding> findByCategoryIgnoreCase(String category);

    boolean existsById(String id);
}
