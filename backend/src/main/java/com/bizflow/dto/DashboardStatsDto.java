package com.bizflow.dto;

public class DashboardStatsDto {
    private double totalSales;
    private double totalPurchases;
    private double grossProfit;
    private long totalInvoices;
    private long totalCustomers;
    private long totalProducts;
    private long lowStockCount;
    private double pendingReceivables;

    public DashboardStatsDto() {}

    public DashboardStatsDto(double totalSales, double totalPurchases, double grossProfit,
                             long totalInvoices, long totalCustomers, long totalProducts,
                             long lowStockCount, double pendingReceivables) {
        this.totalSales = totalSales;
        this.totalPurchases = totalPurchases;
        this.grossProfit = grossProfit;
        this.totalInvoices = totalInvoices;
        this.totalCustomers = totalCustomers;
        this.totalProducts = totalProducts;
        this.lowStockCount = lowStockCount;
        this.pendingReceivables = pendingReceivables;
    }

    public double getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(double totalSales) {
        this.totalSales = totalSales;
    }

    public double getTotalPurchases() {
        return totalPurchases;
    }

    public void setTotalPurchases(double totalPurchases) {
        this.totalPurchases = totalPurchases;
    }

    public double getGrossProfit() {
        return grossProfit;
    }

    public void setGrossProfit(double grossProfit) {
        this.grossProfit = grossProfit;
    }

    public long getTotalInvoices() {
        return totalInvoices;
    }

    public void setTotalInvoices(long totalInvoices) {
        this.totalInvoices = totalInvoices;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public double getPendingReceivables() {
        return pendingReceivables;
    }

    public void setPendingReceivables(double pendingReceivables) {
        this.pendingReceivables = pendingReceivables;
    }
}
