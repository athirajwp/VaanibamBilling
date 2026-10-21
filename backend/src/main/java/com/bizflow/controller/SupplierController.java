package com.bizflow.controller;

import com.bizflow.model.Supplier;
import com.bizflow.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suppliers")
@Tag(name = "Suppliers", description = "Endpoints for managing suppliers and supplier ledgers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    @Operation(summary = "List all suppliers or search by query")
    public List<Supplier> list(@RequestParam(value = "q", required = false) String q) {
        if (q != null && !q.trim().isEmpty()) {
            return supplierService.search(q);
        }
        return supplierService.list();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID")
    public Supplier get(@PathVariable String id) {
        return supplierService.get(id);
    }

    @GetMapping("/{id}/ledger")
    @Operation(summary = "Get supplier account balance and ledger report")
    public Map<String, Object> getLedger(@PathVariable String id) {
        return supplierService.getLedger(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new supplier")
    public Supplier create(@RequestBody Supplier supplier) {
        return supplierService.create(supplier);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing supplier")
    public Supplier update(@PathVariable String id, @RequestBody Supplier patch) {
        return supplierService.update(id, patch);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a supplier")
    public void delete(@PathVariable String id) {
        supplierService.delete(id);
    }
}
