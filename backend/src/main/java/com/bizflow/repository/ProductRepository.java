package com.bizflow.repository;

import com.bizflow.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    Optional<Product> findBySku(String sku);

    List<Product> findByCategory(String category);

    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "(p.barcode IS NOT NULL AND LOWER(p.barcode) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Product> search(@Param("q") String q);

    @Query("SELECT p FROM Product p WHERE p.currentStock <= p.minStock")
    List<Product> findLowStockProducts();
}
