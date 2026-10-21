package com.bizflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tax_settings")
public class TaxSetting {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private double rate;

    private String type; // cgst, sgst, igst, custom

    private boolean enabled;

    public TaxSetting() {}

    public TaxSetting(String id, String name, double rate, String type, boolean enabled) {
        this.id = id;
        this.name = name;
        this.rate = rate;
        this.type = type;
        this.enabled = enabled;
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

    public double getRate() {
        return rate;
    }

    public void setRate(double rate) {
        this.rate = rate;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
