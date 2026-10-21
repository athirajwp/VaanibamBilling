package com.bizflow.controller;

import com.bizflow.dto.AppSettingsDto;
import com.bizflow.model.*;
import com.bizflow.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@Tag(name = "Settings", description = "Endpoints for business profile, invoice format, taxes, users, printers, and online store")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    @Operation(summary = "Get full application settings")
    public AppSettingsDto getSettings() {
        return settingsService.getSettings();
    }

    @GetMapping("/business")
    @Operation(summary = "Get business profile info")
    public BusinessInfo getBusiness() {
        return settingsService.getBusiness();
    }

    @PutMapping("/business")
    @Operation(summary = "Update business profile info")
    public BusinessInfo updateBusiness(@RequestBody BusinessInfo patch) {
        return settingsService.updateBusiness(patch);
    }

    @PutMapping("/invoice")
    @Operation(summary = "Update invoice template and print settings")
    public InvoiceSettings updateInvoice(@RequestBody InvoiceSettings patch) {
        return settingsService.updateInvoice(patch);
    }

    @PutMapping("/taxes")
    @Operation(summary = "Save tax settings list")
    public List<TaxSetting> saveTaxes(@RequestBody List<TaxSetting> taxes) {
        return settingsService.saveTaxes(taxes);
    }

    @PutMapping("/users")
    @Operation(summary = "Save system users list")
    public List<User> saveUsers(@RequestBody List<User> users) {
        return settingsService.saveUsers(users);
    }

    @PutMapping("/printers")
    @Operation(summary = "Save printers list")
    public List<PrinterSetting> savePrinters(@RequestBody List<PrinterSetting> printers) {
        return settingsService.savePrinters(printers);
    }

    @PutMapping("/online-store")
    @Operation(summary = "Update online store settings")
    public OnlineStoreSettings updateOnlineStore(@RequestBody OnlineStoreSettings patch) {
        return settingsService.updateOnlineStore(patch);
    }
}
