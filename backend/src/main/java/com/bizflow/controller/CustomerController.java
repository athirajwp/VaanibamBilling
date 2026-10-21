package com.bizflow.controller;

import com.bizflow.dto.CustomerReportDto;
import com.bizflow.model.Customer;
import com.bizflow.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@Tag(name = "Customers", description = "Endpoints for managing customers and customer ledgers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    @Operation(summary = "List all customers or search by query")
    public List<Customer> list(@RequestParam(value = "q", required = false) String q) {
        if (q != null && !q.trim().isEmpty()) {
            return customerService.search(q);
        }
        return customerService.list();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public Customer get(@PathVariable String id) {
        return customerService.get(id);
    }

    @GetMapping("/{id}/ledger")
    @Operation(summary = "Get customer account balance and ledger report")
    public CustomerReportDto getLedger(@PathVariable String id) {
        return customerService.getLedger(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new customer")
    public Customer create(@RequestBody Customer customer) {
        return customerService.create(customer);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing customer")
    public Customer update(@PathVariable String id, @RequestBody Customer patch) {
        return customerService.update(id, patch);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a customer")
    public void delete(@PathVariable String id) {
        customerService.delete(id);
    }
}
