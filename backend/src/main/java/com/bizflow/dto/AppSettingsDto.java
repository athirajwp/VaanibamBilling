package com.bizflow.dto;

import com.bizflow.model.*;
import java.util.List;

public class AppSettingsDto {
    private BusinessInfo business;
    private InvoiceSettings invoice;
    private List<TaxSetting> taxes;
    private List<User> users;
    private List<PrinterSetting> printers;
    private OnlineStoreSettings onlineStore;

    public AppSettingsDto() {}

    public AppSettingsDto(BusinessInfo business, InvoiceSettings invoice, List<TaxSetting> taxes,
                          List<User> users, List<PrinterSetting> printers, OnlineStoreSettings onlineStore) {
        this.business = business;
        this.invoice = invoice;
        this.taxes = taxes;
        this.users = users;
        this.printers = printers;
        this.onlineStore = onlineStore;
    }

    public BusinessInfo getBusiness() {
        return business;
    }

    public void setBusiness(BusinessInfo business) {
        this.business = business;
    }

    public InvoiceSettings getInvoice() {
        return invoice;
    }

    public void setInvoice(InvoiceSettings invoice) {
        this.invoice = invoice;
    }

    public List<TaxSetting> getTaxes() {
        return taxes;
    }

    public void setTaxes(List<TaxSetting> taxes) {
        this.taxes = taxes;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public List<PrinterSetting> getPrinters() {
        return printers;
    }

    public void setPrinters(List<PrinterSetting> printers) {
        this.printers = printers;
    }

    public OnlineStoreSettings getOnlineStore() {
        return onlineStore;
    }

    public void setOnlineStore(OnlineStoreSettings onlineStore) {
        this.onlineStore = onlineStore;
    }
}
