package com.cafe.cafebackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "menu_items")
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemName;

    private double price;

    private String category;

    public Menu() {
    }

    public Long getId() {
        return id;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}