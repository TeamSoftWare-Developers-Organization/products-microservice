package com.skystore.notifications.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Service
public class FcmPushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(FcmPushNotificationService.class);

    /**
     * إرسال إشعار فوري لجهاز محدد عبر Device Registration Token
     */
    public String sendPushNotificationToToken(String targetToken, String title, String body, Map<String, String> data) {
        if (FirebaseApp.getApps().isEmpty()) {
            log.info("[FCM SIMULATION] إشعار إلى الرمز [{}]: العنوان: '{}'، المحتوى: '{}'", targetToken, title, body);
            return "simulated-msg-token-id";
        }

        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setToken(targetToken)
                    .setNotification(notification);

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            String response = FirebaseMessaging.getInstance().send(messageBuilder.build());
            log.info("✅ تم إرسال إشعار FCM بنجاح. معرف الرسالة: {}", response);
            return response;
        } catch (Exception e) {
            log.error("❌ فشل إرسال إشعار FCM للرمز [{}]: {}", targetToken, e.getMessage(), e);
            return null;
        }
    }

    /**
     * إرسال إشعار لموضوع عام أو خاص بالمستخدم (Topic Broadcasting)
     * مثل: orders_user123 أو shipments_SKY-XXXXX
     */
    public String sendTopicNotification(String topic, String title, String body, Map<String, String> data) {
        if (FirebaseApp.getApps().isEmpty()) {
            log.info("[FCM SIMULATION] إشعار للموضوع [topic: {}]: العنوان: '{}'، المحتوى: '{}'", topic, title, body);
            return "simulated-msg-topic-id";
        }

        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setTopic(topic)
                    .setNotification(notification);

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            String response = FirebaseMessaging.getInstance().send(messageBuilder.build());
            log.info("✅ تم إرسال إشعار FCM للموضوع [{}] بنجاح. المعرف: {}", topic, response);
            return response;
        } catch (Exception e) {
            log.error("❌ فشل إرسال إشعار FCM للموضوع [{}]: {}", topic, e.getMessage(), e);
            return null;
        }
    }

    public String sendTopicNotification(String topic, String title, String body) {
        return sendTopicNotification(topic, title, body, Collections.emptyMap());
    }
}
