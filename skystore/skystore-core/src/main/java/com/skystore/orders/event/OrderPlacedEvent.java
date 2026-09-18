package com.skystore.orders.event;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

public record OrderPlacedEvent(
    Long orderId,
    String userId,
    BigDecimal totalAmount,
    List<OrderItemDto> items
) implements Serializable {
    public record OrderItemDto(Long productId, Integer quantity, BigDecimal price) implements Serializable {}
}