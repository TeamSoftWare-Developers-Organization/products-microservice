package com.skystore.shipping.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
public class Shipment {

    public enum ShipmentStatus {
        PREPARING,   // قيد التجهيز داخل المستودع
        DISPATCHED,  // خرجت من المستودع مع المندوب/شركة الشحن
        IN_TRANSIT,  // في الطريق
        DELIVERED,   // تم التسليم للعميل
        RETURNED     // مرتجعة
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(nullable = false, unique = true)
    private String trackingNumber;

    private String carrier; // مثل: Aramex, DHL, Local Courier

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status = ShipmentStatus.PREPARING;

    private String shippingAddress;

    private LocalDateTime estimatedDeliveryDate;

    private LocalDateTime updatedAt = LocalDateTime.now();

    public Shipment() {}

    public Shipment(Long orderId, Warehouse warehouse, String trackingNumber, String carrier, String shippingAddress) {
        this.orderId = orderId;
        this.warehouse = warehouse;
        this.trackingNumber = trackingNumber;
        this.carrier = carrier;
        this.shippingAddress = shippingAddress;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public Long getOrderId() { return orderId; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public String getTrackingNumber() { return trackingNumber; }
    public String getCarrier() { return carrier; }
    public void setCarrier(String carrier) { this.carrier = carrier; }
    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { 
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public LocalDateTime getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(LocalDateTime estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
