package com.skystore.shipping.listener;

import com.skystore.orders.event.OrderPlacedEvent;
import com.skystore.shipping.service.ShippingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class ShippingOrderConsumer {

    private static final Logger log = LoggerFactory.getLogger(ShippingOrderConsumer.class);
    private final ShippingService shippingService;

    public ShippingOrderConsumer(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @RabbitListener(queues = "shipping.queue")
    public void onOrderPlaced(OrderPlacedEvent event) {
        log.info("استلام حدث إنشاء الطلب رقم: {} لإنشاء بوليصة شحن وتجهيز المستودع", event.orderId());
        try {
            shippingService.createShipmentForOrder(event.orderId(), "عنوان التوصيل المسجل للمستخدم: " + event.userId());
        } catch (Exception e) {
            log.error("خطأ أثناء إنشاء بوليصة الشحن للطلب رقم: {}", event.orderId(), e);
        }
    }
}
