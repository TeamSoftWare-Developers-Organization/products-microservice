package com.skystore.batch.dto;

import java.math.BigDecimal;

public record StockUpdateRecord(
    Long productId,
    Integer newStock,
    BigDecimal adjustedPrice
) {}
