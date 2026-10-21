package com.bizflow.service;

import com.bizflow.exception.ResourceNotFoundException;
import com.bizflow.model.Expense;
import com.bizflow.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public List<Expense> list() {
        return expenseRepository.findAllOrderByDateDesc();
    }

    public Expense get(String id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
    }

    public List<Expense> getInRange(String from, String to) {
        return expenseRepository.findExpensesInRange(from, to);
    }

    @Transactional
    public Expense create(Expense expense) {
        if (expense.getId() == null || expense.getId().isEmpty()) {
            expense.setId("exp-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return expenseRepository.save(expense);
    }

    @Transactional
    public Expense update(String id, Expense patch) {
        Expense existing = get(id);
        if (patch.getDate() != null) existing.setDate(patch.getDate());
        if (patch.getCategory() != null) existing.setCategory(patch.getCategory());
        if (patch.getDescription() != null) existing.setDescription(patch.getDescription());
        if (patch.getAmount() > 0) existing.setAmount(patch.getAmount());
        if (patch.getPaymentMethod() != null) existing.setPaymentMethod(patch.getPaymentMethod());
        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());
        return expenseRepository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        Expense existing = get(id);
        expenseRepository.delete(existing);
    }

    public List<Map<String, Object>> getCategoryBreakdown() {
        List<Expense> all = expenseRepository.findAll();
        Map<String, Double> map = new HashMap<>();
        for (Expense e : all) {
            map.put(e.getCategory(), map.getOrDefault(e.getCategory(), 0.0) + e.getAmount());
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Double> entry : map.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", entry.getKey());
            item.put("amount", entry.getValue());
            result.add(item);
        }
        return result;
    }
}
