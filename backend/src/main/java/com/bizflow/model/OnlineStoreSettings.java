package com.bizflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "online_store_settings")
public class OnlineStoreSettings {

    @Id
    private String id = "default";

    private String storeName;
    private String tagline;
    private String logo;
    private String banner;
    private String contact;
    private String email;

    @Column(length = 500)
    private String address;

    private String theme = "blue";
    private String status = "online"; // online, offline

    @Column(columnDefinition = "TEXT")
    private String productsPublished; // JSON array of product IDs

    public OnlineStoreSettings() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public String getBanner() {
        return banner;
    }

    public void setBanner(String banner) {
        this.banner = banner;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getProductsPublished() {
        return productsPublished;
    }

    public void setProductsPublished(String productsPublished) {
        this.productsPublished = productsPublished;
    }
}
