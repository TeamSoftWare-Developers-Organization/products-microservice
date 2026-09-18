package com.skystore.cart.domain;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Cart implements Serializable {
    private String userId;
    private List<CartItem> items = new ArrayList<>();
    private Double totalPrice = 0.0;

    public Cart() {}

    public Cart(String userId) {
        this.userId = userId;
    }

    @SuppressWarnings("null")
	public void recalculateTotal() {
        this.totalPrice = items.stream()
                .mapToDouble(CartItem::getSubtotal)
                .sum();
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public List<CartItem> getItems() { return items; }
    public void setItems(List<CartItem> items) { this.items = items; }
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
}