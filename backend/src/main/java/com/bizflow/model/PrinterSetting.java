package com.bizflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "printer_settings")
public class PrinterSetting {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String type; // A4 Printer, Thermal Printer, Bluetooth Printer, Barcode Printer

    private boolean isDefault;

    private boolean connected;

    public PrinterSetting() {}

    public PrinterSetting(String id, String name, String type, boolean isDefault, boolean connected) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.isDefault = isDefault;
        this.connected = connected;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }

    public boolean isConnected() {
        return connected;
    }

    public void setConnected(boolean connected) {
        this.connected = connected;
    }
}
