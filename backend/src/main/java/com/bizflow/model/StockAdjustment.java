package com.bizflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "stock_adjustments")
public class StockAdjustment {

    @Id
    private String id;

    @Column(nullable = false)
    private String productId;

    private String productName;

    @Column(nullable = false)
    private String type; // "in" or "out"

    @Column(nullable = false)
    private int qty;

    private String reason;

    @Column(length = 500)
    private String notes;

    private String date;

    @PrePersist
    public void prePersist() {
        if (date == null) {
            date = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        }
    }

    public StockAdjustment() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getQty() {
        return qty;
    }

    public void setQty(int qty) {
        this.qty = qty;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}
