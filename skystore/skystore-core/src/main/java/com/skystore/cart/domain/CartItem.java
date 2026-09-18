package com.skystore.cart.domain;

import java.io.Serializable;

public class CartItem implements Serializable {
    private String productId;
    private String name;
    private Double price;
    private Integer quantity;
    private Double subtotal;

    public CartItem() {}

    public CartItem(String productId, String name, Double price, Integer quantity) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.subtotal = price * quantity;
    }

    public void updateQuantity(Integer quantity) {
        this.quantity = quantity;
        this.subtotal = this.price * quantity;
    }

    // Getters and Setters
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
}