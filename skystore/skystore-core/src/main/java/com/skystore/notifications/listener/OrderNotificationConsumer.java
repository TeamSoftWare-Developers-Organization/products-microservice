package com.skystore.notifications.listener;

import com.skystore.notifications.dto.NotificationPayload;
import com.skystore.notifications.service.FcmPushNotificationService;
import com.skystore.notifications.service.NotificationDispatcher;
import com.skystore.orders.event.OrderPlacedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class OrderNotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderNotificationConsumer.class);
    private final NotificationDispatcher dispatcher;
    private final FcmPushNotificationService fcmService;

    public OrderNotificationConsumer(NotificationDispatcher dispatcher, FcmPushNotificationService fcmService) {
        this.dispatcher = dispatcher;
        this.fcmService = fcmService;
    }

    @RabbitListener(queues = "${app.rabbitmq.queue}")
    public void onOrderPlaced(OrderPlacedEvent event) {
        log.info("استلام حدث الطلب رقم: {} للمستخدم: {}", event.orderId(), event.userId());

        String title = "تأكيد الطلب";
        String message = "تم استلام طلبك رقم #" + event.orderId() + " بقيمة $" + event.totalAmount() + " بنجاح وجارٍ التجهيز.";

        NotificationPayload payload = NotificationPayload.info(
                title,
                message,
                event
        );

        // 1 & 2. إرسال الإشعار اللحظي إلى جلسة المستخدم المفتوحة عبر WebSockets / STOMP
        dispatcher.sendToUser(event.userId(), payload);

        // 3. إرسال إشعار دفع عبر FCM إلى هاتف العميل (Background Push Notification)
        fcmService.sendTopicNotification(
                "user_" + event.userId(),
                title,
                message,
                Map.of(
                        "orderId", String.valueOf(event.orderId()),
                        "type", "ORDER_CREATED",
                        "totalAmount", String.valueOf(event.totalAmount())
                )
        );
    }
}
