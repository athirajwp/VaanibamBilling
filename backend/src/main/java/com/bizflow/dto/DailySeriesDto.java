package com.bizflow.dto;

public class DailySeriesDto {
    private String date;
    private double sales;
    private double purchases;
    private double profit;

    public DailySeriesDto() {}

    public DailySeriesDto(String date, double sales, double purchases, double profit) {
        this.date = date;
        this.sales = sales;
        this.purchases = purchases;
        this.profit = profit;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
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
}
