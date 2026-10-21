package com.bizflow.repository;

import com.bizflow.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "(c.phone IS NOT NULL AND LOWER(c.phone) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Customer> search(@Param("q") String q);
}
