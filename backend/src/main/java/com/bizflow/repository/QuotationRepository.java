package com.bizflow.repository;

import com.bizflow.model.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, String> {
    Optional<Quotation> findByQuotationNumber(String quotationNumber);

    List<Quotation> findByCustomerIdOrderByDateDesc(String customerId);

    @Query("SELECT q FROM Quotation q ORDER BY q.createdAt DESC")
    List<Quotation> findAllOrderByCreatedAtDesc();
}
