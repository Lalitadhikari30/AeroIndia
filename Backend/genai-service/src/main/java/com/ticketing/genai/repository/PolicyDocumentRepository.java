package com.ticketing.genai.repository;

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
