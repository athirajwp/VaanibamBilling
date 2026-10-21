package com.bizflow.controller;

import com.bizflow.model.Expense;
import com.bizflow.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@Tag(name = "Expenses", description = "Endpoints for managing business expenses and expense categories")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    @Operation(summary = "List all expenses or filter by date range")
    public List<Expense> list(@RequestParam(value = "from", required = false) String from,
                              @RequestParam(value = "to", required = false) String to) {
        if (from != null && to != null) {
            return expenseService.getInRange(from, to);
        }
        return expenseService.list();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get expense by ID")
    public Expense get(@PathVariable String id) {
        return expenseService.get(id);
    }

    @GetMapping("/breakdown")
    @Operation(summary = "Get expense breakdown grouped by category")
    public List<Map<String, Object>> getBreakdown() {
        return expenseService.getCategoryBreakdown();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Record a new expense")
    public Expense create(@RequestBody Expense expense) {
        return expenseService.create(expense);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an expense")
    public Expense update(@PathVariable String id, @RequestBody Expense patch) {
        return expenseService.update(id, patch);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an expense")
    public void delete(@PathVariable String id) {
        expenseService.delete(id);
    }
}
