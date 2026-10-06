package com.skystore.shipping.service;

import com.skystore.shipping.domain.Shipment;
import com.skystore.shipping.domain.Warehouse;
import com.skystore.shipping.repository.ShipmentRepository;
import com.skystore.shipping.repository.WarehouseRepository;
import com.skystore.notifications.service.FcmPushNotificationService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class ShippingService {

    private final ShipmentRepository shipmentRepository;
    private final WarehouseRepository warehouseRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final FcmPushNotificationService fcmService;

    public ShippingService(ShipmentRepository shipmentRepository,
                           WarehouseRepository warehouseRepository,
                           SimpMessagingTemplate messagingTemplate,
                           FcmPushNotificationService fcmService) {
        this.shipmentRepository = shipmentRepository;
        this.warehouseRepository = warehouseRepository;
        this.messagingTemplate = messagingTemplate;
        this.fcmService = fcmService;
    }

    @Transactional
    public Shipment createShipmentForOrder(Long orderId, String shippingAddress) {
        // تعيين المستودع الافتراضي الرئيسي (أو البحث عن الأقرب)
        Warehouse warehouse = warehouseRepository.findByCode("WH-MAIN")
                .orElseGet(() -> warehouseRepository.save(new Warehouse("WH-MAIN", "المستودع المركزي", "Tripoli / Benghazi")));

        String trackingNo = "SKY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Shipment shipment = new Shipment(orderId, warehouse, trackingNo, "SkyExpress", shippingAddress);
        shipment.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(2));

        return shipmentRepository.save(shipment);
    }

    @Transactional
    public Shipment updateShipmentStatus(String trackingNumber, Shipment.ShipmentStatus newStatus) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new IllegalArgumentException("رقم التتبع غير موجود: " + trackingNumber));

        shipment.setStatus(newStatus);
        Shipment updated = shipmentRepository.save(shipment);

        // 1. إرسال إشعار لحظي للعميل عبر WebSockets بتحديث حالة الشحنة
        messagingTemplate.convertAndSend(
                "/topic/shipments/" + trackingNumber,
                "تم تحديث حالة الشحنة #" + trackingNumber + " إلى: " + newStatus.name()
        );

        // 2. إرسال إشعار دفع عبر FCM إلى المشتركين في تتبع الشحنة
        fcmService.sendTopicNotification(
                "shipment_" + trackingNumber,
                "تحديث الشحنة",
                "تم تحديث حالة شحنتك #" + trackingNumber + " إلى: " + newStatus.name(),
                Map.of(
                        "trackingNumber", trackingNumber,
                        "orderId", String.valueOf(shipment.getOrderId()),
                        "status", newStatus.name()
                )
        );

        return updated;
    }

    public Shipment getShipmentByOrder(Long orderId) {
        return shipmentRepository.findByOrderId(orderId).orElse(null);
    }

    public Shipment trackShipment(String trackingNumber) {
        return shipmentRepository.findByTrackingNumber(trackingNumber).orElse(null);
    }
}
