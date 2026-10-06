package com.skystore.shipping.controller;

import com.skystore.shipping.domain.Shipment;
import com.skystore.shipping.service.ShippingService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
public class ShippingGraphQLController {

    private final ShippingService shippingService;

    public ShippingGraphQLController(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @QueryMapping
    public Shipment trackShipment(@Argument String trackingNumber) {
        return shippingService.trackShipment(trackingNumber);
    }

    @QueryMapping
    public Shipment orderShipment(@Argument Long orderId) {
        return shippingService.getShipmentByOrder(orderId);
    }

    // مقيد فقط بمديري المستودعات أو مسؤولي النظام
    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Shipment updateShipmentStatus(@Argument String trackingNumber, @Argument Shipment.ShipmentStatus status) {
        return shippingService.updateShipmentStatus(trackingNumber, status);
    }
}
