package com.bizflow.dto;

public class SalesSummaryDto {
    private double sales;
    private double purchases;
    private double profit;
    private int orders;
    private double outstanding;

    public SalesSummaryDto() {}

    public SalesSummaryDto(double sales, double purchases, double profit, int orders, double outstanding) {
        this.sales = sales;
        this.purchases = purchases;
        this.profit = profit;
        this.orders = orders;
        this.outstanding = outstanding;
    }

    public double getSales() {
        return sales;
    }

    public void setSales(double sales) {
        this.sales = sales;
    }

    public double getPurchases() {
        return purchases;
    }

    public void setPurchases(double purchases) {
        this.purchases = purchases;
    }

    public double getProfit() {
        return profit;
    }

    public void setProfit(double profit) {
        this.profit = profit;
    }

    public int getOrders() {
        return orders;
    }

    public void setOrders(int orders) {
        this.orders = orders;
    }

    public double getOutstanding() {
        return outstanding;
    }

    public void setOutstanding(double outstanding) {
        this.outstanding = outstanding;
    }
}
