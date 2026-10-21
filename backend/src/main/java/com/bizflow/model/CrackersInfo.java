package com.bizflow.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class CrackersInfo {

    private String productType;
    private Integer boxQuantity;
    private Integer piecesPerBox;
    private String purchaseUnit;
    private String sellingUnit;
    private Double wholesalePrice;
    private Double retailPrice;
    private Double seasonalPrice;

    @Column(columnDefinition = "TEXT")
    private String bulkPricing; // JSON string or comma-separated tiers

    public CrackersInfo() {}

    public CrackersInfo(String productType, Integer boxQuantity, Integer piecesPerBox,
                        String purchaseUnit, String sellingUnit, Double wholesalePrice,
                        Double retailPrice, Double seasonalPrice, String bulkPricing) {
        this.productType = productType;
        this.boxQuantity = boxQuantity;
        this.piecesPerBox = piecesPerBox;
        this.purchaseUnit = purchaseUnit;
        this.sellingUnit = sellingUnit;
        this.wholesalePrice = wholesalePrice;
        this.retailPrice = retailPrice;
        this.seasonalPrice = seasonalPrice;
        this.bulkPricing = bulkPricing;
    }

    public String getProductType() {
        return productType;
    }

    public void setProductType(String productType) {
        this.productType = productType;
    }

    public Integer getBoxQuantity() {
        return boxQuantity;
    }

    public void setBoxQuantity(Integer boxQuantity) {
        this.boxQuantity = boxQuantity;
    }

    public Integer getPiecesPerBox() {
        return piecesPerBox;
    }

    public void setPiecesPerBox(Integer piecesPerBox) {
        this.piecesPerBox = piecesPerBox;
    }

    public String getPurchaseUnit() {
        return purchaseUnit;
    }

    public void setPurchaseUnit(String purchaseUnit) {
        this.purchaseUnit = purchaseUnit;
    }

    public String getSellingUnit() {
        return sellingUnit;
    }

    public void setSellingUnit(String sellingUnit) {
        this.sellingUnit = sellingUnit;
    }

    public Double getWholesalePrice() {
        return wholesalePrice;
    }

    public void setWholesalePrice(Double wholesalePrice) {
        this.wholesalePrice = wholesalePrice;
    }

    public Double getRetailPrice() {
        return retailPrice;
    }

    public void setRetailPrice(Double retailPrice) {
        this.retailPrice = retailPrice;
    }

    public Double getSeasonalPrice() {
        return seasonalPrice;
    }

    public void setSeasonalPrice(Double seasonalPrice) {
        this.seasonalPrice = seasonalPrice;
    }

    public String getBulkPricing() {
        return bulkPricing;
    }

    public void setBulkPricing(String bulkPricing) {
        this.bulkPricing = bulkPricing;
    }
}
