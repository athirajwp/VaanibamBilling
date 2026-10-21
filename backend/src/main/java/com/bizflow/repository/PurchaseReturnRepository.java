package com.bizflow.repository;

import com.bizflow.model.PurchaseReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseReturnRepository extends JpaRepository<PurchaseReturn, String> {
    List<PurchaseReturn> findByPurchaseId(String purchaseId);

    @Query("SELECT r FROM PurchaseReturn r ORDER BY r.createdAt DESC")
    List<PurchaseReturn> findAllOrderByCreatedAtDesc();
}
