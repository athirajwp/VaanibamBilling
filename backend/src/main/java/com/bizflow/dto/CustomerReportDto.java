package com.bizflow.dto;

public class CustomerReportDto {
    private String id;
    private String name;
    private String phone;
    private String email;
    private String gstin;
    private double totalSales;
    private double totalPaid;
    private double outstanding;
    private String lastPurchase;

    public CustomerReportDto() {}

    public CustomerReportDto(String id, String name, String phone, String email, String gstin,
                             double totalSales, double totalPaid, double outstanding, String lastPurchase) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.gstin = gstin;
        this.totalSales = totalSales;
        this.totalPaid = totalPaid;
        this.outstanding = outstanding;
        this.lastPurchase = lastPurchase;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGstin() {
        return gstin;
    }

    public void setGstin(String gstin) {
        this.gstin = gstin;
    }

    public double getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(double totalSales) {
        this.totalSales = totalSales;
    }

    public double getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(double totalPaid) {
        this.totalPaid = totalPaid;
    }

    public double getOutstanding() {
        return outstanding;
    }

    public void setOutstanding(double outstanding) {
        this.outstanding = outstanding;
    }

    public String getLastPurchase() {
        return lastPurchase;
    }

    public void setLastPurchase(String lastPurchase) {
        this.lastPurchase = lastPurchase;
    }
}
