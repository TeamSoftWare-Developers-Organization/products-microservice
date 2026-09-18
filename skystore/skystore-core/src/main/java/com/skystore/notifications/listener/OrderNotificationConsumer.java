package com.skystore.notifications.listener;

import com.skystore.notifications.dto.NotificationPayload;
import com.skystore.notifications.service.NotificationDispatcher;
import com.skystore.orders.event.OrderPlacedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderNotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderNotificationConsumer.class);
    private final NotificationDispatcher dispatcher;

    public OrderNotificationConsumer(NotificationDispatcher dispatcher) {
        this.dispatcher = dispatcher;
    }

    @RabbitListener(queues = "${app.rabbitmq.queue}")
    public void onOrderPlaced(OrderPlacedEvent event) {
        log.info("استلام حدث الطلب رقم: {} للمستخدم: {}", event.orderId(), event.userId());

        NotificationPayload payload = NotificationPayload.info(
                "تأكيد الطلب",
                "تم استلام طلبك رقم #" + event.orderId() + " بقيمة $" + event.totalAmount() + " بنجاح وجارٍ التجهيز.",
                event
        );

        // إرسال الإشعار اللحظي إلى جلسة المستخدم المفتوحة
        dispatcher.sendToUser(event.userId(), payload);
    }
}
