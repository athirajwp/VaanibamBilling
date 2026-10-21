package com.bizflow.controller;

import com.bizflow.dto.DraftPurchaseDto;
import com.bizflow.dto.PaymentRecordDto;
import com.bizflow.model.Purchase;
import com.bizflow.model.PurchaseReturn;
import com.bizflow.service.PurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@Tag(name = "Purchases & Inward Bills", description = "Endpoints for inward supplier bills, payments, cancellations, and purchase returns")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @GetMapping
    @Operation(summary = "List all purchase bills")
    public List<Purchase> list() {
        return purchaseService.list();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase bill by ID")
    public Purchase get(@PathVariable String id) {
        return purchaseService.get(id);
    }

    @GetMapping("/supplier/{supplierId}")
    @Operation(summary = "List purchase bills for a supplier")
    public List<Purchase> getBySupplier(@PathVariable String supplierId) {
        return purchaseService.getBySupplier(supplierId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create inward purchase bill with automatic stock increment")
    public Purchase create(@RequestBody DraftPurchaseDto dto) {
        return purchaseService.createPurchase(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update purchase bill")
    public Purchase update(@PathVariable String id, @RequestBody Purchase patch) {
        return purchaseService.updatePurchase(id, patch);
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Record payment for a purchase bill")
    public Purchase recordPayment(@PathVariable String id, @RequestBody PaymentRecordDto payment) {
        return purchaseService.recordPayment(id, payment);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a purchase bill and deduct added stock")
    public Purchase cancel(@PathVariable String id) {
        return purchaseService.cancelPurchase(id);
    }

    // Purchase Returns
    @GetMapping("/returns")
    @Operation(summary = "List all purchase returns")
    public List<PurchaseReturn> listReturns() {
        return purchaseService.listReturns();
    }

    @PostMapping("/returns")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create purchase return and reduce product inventory")
    public PurchaseReturn createReturn(@RequestBody PurchaseReturn returnObj) {
        return purchaseService.createReturn(returnObj);
    }
}
