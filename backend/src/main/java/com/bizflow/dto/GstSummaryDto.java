package com.bizflow.dto;

public class GstSummaryDto {
    private double taxableSales;
    private double cgst;
    private double sgst;
    private double igst;
    private double totalGst;
    private double purchaseTaxable;
    private double purchaseCgst;
    private double purchaseSgst;
    private double purchaseGst;
    private double netPayable;

    public GstSummaryDto() {}

    public GstSummaryDto(double taxableSales, double cgst, double sgst, double igst, double totalGst,
                         double purchaseTaxable, double purchaseCgst, double purchaseSgst,
                         double purchaseGst, double netPayable) {
        this.taxableSales = taxableSales;
        this.cgst = cgst;
        this.sgst = sgst;
        this.igst = igst;
        this.totalGst = totalGst;
        this.purchaseTaxable = purchaseTaxable;
        this.purchaseCgst = purchaseCgst;
        this.purchaseSgst = purchaseSgst;
        this.purchaseGst = purchaseGst;
        this.netPayable = netPayable;
    }

    public double getTaxableSales() {
        return taxableSales;
    }

    public void setTaxableSales(double taxableSales) {
        this.taxableSales = taxableSales;
    }

    public double getCgst() {
        return cgst;
    }

    public void setCgst(double cgst) {
        this.cgst = cgst;
    }

    public double getSgst() {
        return sgst;
    }

    public void setSgst(double sgst) {
        this.sgst = sgst;
    }

    public double getIgst() {
        return igst;
    }

    public void setIgst(double igst) {
        this.igst = igst;
    }

    public double getTotalGst() {
        return totalGst;
    }

    public void setTotalGst(double totalGst) {
        this.totalGst = totalGst;
    }

    public double getPurchaseTaxable() {
        return purchaseTaxable;
    }

    public void setPurchaseTaxable(double purchaseTaxable) {
        this.purchaseTaxable = purchaseTaxable;
    }

    public double getPurchaseCgst() {
        return purchaseCgst;
    }

    public void setPurchaseCgst(double purchaseCgst) {
        this.purchaseCgst = purchaseCgst;
    }

    public double getPurchaseSgst() {
        return purchaseSgst;
    }

    public void setPurchaseSgst(double purchaseSgst) {
        this.purchaseSgst = purchaseSgst;
    }

    public double getPurchaseGst() {
        return purchaseGst;
    }

    public void setPurchaseGst(double purchaseGst) {
        this.purchaseGst = purchaseGst;
    }

    public double getNetPayable() {
        return netPayable;
    }

    public void setNetPayable(double netPayable) {
        this.netPayable = netPayable;
    }
}
