package com.bizflow.repository;

import com.bizflow.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    List<Invoice> findByCustomerIdOrderByDateDesc(String customerId);

    @Query("SELECT i FROM Invoice i WHERE i.status != 'cancelled' AND i.date >= :from AND i.date <= :to ORDER BY i.date ASC")
    List<Invoice> findValidInvoicesInRange(@Param("from") String from, @Param("to") String to);

    @Query("SELECT i FROM Invoice i ORDER BY i.createdAt DESC")
    List<Invoice> findAllOrderByCreatedAtDesc();
}
