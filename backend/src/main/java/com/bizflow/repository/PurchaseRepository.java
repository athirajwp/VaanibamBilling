package com.bizflow.repository;

import com.bizflow.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, String> {
    Optional<Purchase> findByBillNumber(String billNumber);

    List<Purchase> findBySupplierIdOrderByDateDesc(String supplierId);

    @Query("SELECT p FROM Purchase p WHERE p.status != 'cancelled' AND p.date >= :from AND p.date <= :to ORDER BY p.date ASC")
    List<Purchase> findValidPurchasesInRange(@Param("from") String from, @Param("to") String to);

    @Query("SELECT p FROM Purchase p ORDER BY p.createdAt DESC")
    List<Purchase> findAllOrderByCreatedAtDesc();
}
