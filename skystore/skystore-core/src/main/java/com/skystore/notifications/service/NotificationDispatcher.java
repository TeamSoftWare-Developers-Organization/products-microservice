package com.skystore.notifications.service;

import com.skystore.notifications.dto.NotificationPayload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationDispatcher {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationDispatcher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * @param userId
     * @param payload
     */
    @SuppressWarnings("null")
	public void sendToUser(String userId, NotificationPayload payload) {
        // يرسل الإشعار للمسار الخاص بالمستخدم: /user/{userId}/queue/notifications
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", payload);
    }

    @SuppressWarnings("null")
	public void broadcast(NotificationPayload payload) {
        // إرسال تنبيه عام لكافة المتصلين
        messagingTemplate.convertAndSend("/topic/alerts", payload);
    }
}
