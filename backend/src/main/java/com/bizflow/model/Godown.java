package com.bizflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "godowns")
public class Godown {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String address;

    private String manager;

    @Column(length = 500)
    private String description;

    public Godown() {}

    public Godown(String id, String name, String address, String manager, String description) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.manager = manager;
        this.description = description;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getManager() {
        return manager;
    }

    public void setManager(String manager) {
        this.manager = manager;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
