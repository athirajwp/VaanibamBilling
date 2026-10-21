package com.bizflow.repository;

import com.bizflow.model.SalesReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesReturnRepository extends JpaRepository<SalesReturn, String> {
    List<SalesReturn> findByInvoiceId(String invoiceId);

    @Query("SELECT r FROM SalesReturn r ORDER BY r.createdAt DESC")
    List<SalesReturn> findAllOrderByCreatedAtDesc();
}
