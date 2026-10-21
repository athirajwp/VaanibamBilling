package com.bizflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "products")
public class Product {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String sku;

    private String barcode;

    private String category;

    private String brand;

    private String unit;

    @Column(nullable = false)
    private double purchasePrice;

    @Column(nullable = false)
    private double sellingPrice;

    private Double mrp;

    private Double wholesalePrice;

    private String taxType; // gst, non-gst, exempt

    private double gstRate;

    private String hsn;

    private int openingStock;

    private int currentStock;

    private int minStock;

    private String godown;

    @Column(length = 1000)
    private String image;

    private String status; // active, inactive

    private Boolean isCrackers = false;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "wholesalePrice", column = @Column(name = "crackers_wholesale_price")),
        @AttributeOverride(name = "retailPrice", column = @Column(name = "crackers_retail_price")),
        @AttributeOverride(name = "seasonalPrice", column = @Column(name = "crackers_seasonal_price")),
        @AttributeOverride(name = "productType", column = @Column(name = "crackers_product_type")),
        @AttributeOverride(name = "boxQuantity", column = @Column(name = "crackers_box_quantity")),
        @AttributeOverride(name = "piecesPerBox", column = @Column(name = "crackers_pieces_per_box")),
        @AttributeOverride(name = "purchaseUnit", column = @Column(name = "crackers_purchase_unit")),
        @AttributeOverride(name = "sellingUnit", column = @Column(name = "crackers_selling_unit")),
        @AttributeOverride(name = "bulkPricing", column = @Column(name = "crackers_bulk_pricing", columnDefinition = "TEXT"))
    })
    private CrackersInfo crackers;

    private String createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        }
        if (status == null) {
            status = "active";
        }
    }

    public Product() {}

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

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public double getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(double purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public double getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(double sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    public Double getMrp() {
        return mrp;
    }

    public void setMrp(Double mrp) {
        this.mrp = mrp;
    }

    public Double getWholesalePrice() {
        return wholesalePrice;
    }

    public void setWholesalePrice(Double wholesalePrice) {
        this.wholesalePrice = wholesalePrice;
    }

    public String getTaxType() {
        return taxType;
    }

    public void setTaxType(String taxType) {
        this.taxType = taxType;
    }

    public double getGstRate() {
        return gstRate;
    }

    public void setGstRate(double gstRate) {
        this.gstRate = gstRate;
    }

    public String getHsn() {
        return hsn;
    }

    public void setHsn(String hsn) {
        this.hsn = hsn;
    }

    public int getOpeningStock() {
        return openingStock;
    }

    public void setOpeningStock(int openingStock) {
        this.openingStock = openingStock;
    }

    public int getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(int currentStock) {
        this.currentStock = currentStock;
    }

    public int getMinStock() {
        return minStock;
    }

    public void setMinStock(int minStock) {
        this.minStock = minStock;
    }

    public String getGodown() {
        return godown;
    }

    public void setGodown(String godown) {
        this.godown = godown;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsCrackers() {
        return isCrackers;
    }

    public void setIsCrackers(Boolean isCrackers) {
        this.isCrackers = isCrackers;
    }

    public CrackersInfo getCrackers() {
        return crackers;
    }

    public void setCrackers(CrackersInfo crackers) {
        this.crackers = crackers;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
