package com.bizflow.controller;

import com.bizflow.dto.DraftInvoiceDto;
import com.bizflow.model.Invoice;
import com.bizflow.model.Quotation;
import com.bizflow.service.QuotationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quotations")
@Tag(name = "Quotations", description = "Endpoints for creating quotations, status updates, and converting quotations to invoices")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(QuotationService quotationService) {
        this.quotationService = quotationService;
    }

    @GetMapping
    @Operation(summary = "List all quotations")
    public List<Quotation> list() {
        return quotationService.list();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get quotation by ID")
    public Quotation get(@PathVariable String id) {
        return quotationService.get(id);
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "List quotations for a customer")
    public List<Quotation> getByCustomer(@PathVariable String customerId) {
        return quotationService.getByCustomer(customerId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new quotation")
    public Quotation create(@RequestBody DraftInvoiceDto dto) {
        return quotationService.createQuotation(dto);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update quotation status")
    public Quotation updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return quotationService.updateStatus(id, status);
    }

    @PostMapping("/{id}/convert")
    @Operation(summary = "Convert quotation to a finalized invoice")
    public Invoice convert(@PathVariable String id) {
        return quotationService.convertToInvoice(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a quotation")
    public void delete(@PathVariable String id) {
        quotationService.delete(id);
    }
}
