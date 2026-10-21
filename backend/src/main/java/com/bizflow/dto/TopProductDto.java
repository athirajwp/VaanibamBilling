package com.bizflow.dto;

public class TopProductDto {
    private String productId;
    private String productName;
    private int units;
    private double revenue;
    private double profit;

    public TopProductDto() {}

    public TopProductDto(String productId, String productName, int units, double revenue, double profit) {
        this.productId = productId;
        this.productName = productName;
        this.units = units;
        this.revenue = revenue;
        this.profit = profit;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public int getUnits() {
        return units;
    }

    public void setUnits(int units) {
        this.units = units;
    }

    public double getRevenue() {
        return revenue;
    }

    public void setRevenue(double revenue) {
        this.revenue = revenue;
    }

    public double getProfit() {
        return profit;
    }

    public void setProfit(double profit) {
        this.profit = profit;
    }
}
