package com.bizflow.repository;

import com.bizflow.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, String> {
    List<Expense> findByCategory(String category);

    @Query("SELECT e FROM Expense e WHERE e.date >= :from AND e.date <= :to ORDER BY e.date ASC")
    List<Expense> findExpensesInRange(@Param("from") String from, @Param("to") String to);

    @Query("SELECT e FROM Expense e ORDER BY e.date DESC")
    List<Expense> findAllOrderByDateDesc();
}
