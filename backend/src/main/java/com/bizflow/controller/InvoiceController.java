package com.bizflow.controller;

import com.bizflow.dto.DraftInvoiceDto;
import com.bizflow.dto.PaymentRecordDto;
import com.bizflow.model.Invoice;
import com.bizflow.model.SalesReturn;
import com.bizflow.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@Tag(name = "Billing & Invoices", description = "Endpoints for creating sales invoices, processing payments, cancellations, and sales returns")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    @Operation(summary = "List all invoices")
    public List<Invoice> list() {
        return invoiceService.list();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get invoice by ID")
    public Invoice get(@PathVariable String id) {
        return invoiceService.get(id);
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "List invoices for a customer")
    public List<Invoice> getByCustomer(@PathVariable String customerId) {
        return invoiceService.getByCustomer(customerId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new sales invoice with automatic stock deduction")
    public Invoice create(@RequestBody DraftInvoiceDto dto) {
        return invoiceService.createInvoice(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an invoice")
    public Invoice update(@PathVariable String id, @RequestBody Invoice patch) {
        return invoiceService.updateInvoice(id, patch);
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Record a payment against an invoice")
    public Invoice recordPayment(@PathVariable String id, @RequestBody PaymentRecordDto payment) {
        return invoiceService.recordPayment(id, payment);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an invoice and restore product stock")
    public Invoice cancel(@PathVariable String id) {
        return invoiceService.cancelInvoice(id);
    }

    @PostMapping("/{id}/duplicate")
    @Operation(summary = "Duplicate an invoice as a new draft")
    public Invoice duplicate(@PathVariable String id) {
        return invoiceService.duplicateInvoice(id);
    }

    // Sales Returns
    @GetMapping("/returns")
    @Operation(summary = "List all sales returns")
    public List<SalesReturn> listReturns() {
        return invoiceService.listReturns();
    }

    @PostMapping("/returns")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a sales return, restore inventory, and adjust invoice payment balance")
    public SalesReturn createReturn(@RequestBody SalesReturn salesReturn) {
        return invoiceService.createReturn(salesReturn);
    }
}
