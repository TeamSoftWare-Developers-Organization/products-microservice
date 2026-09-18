package com.skystore.notifications.dto;

import java.io.Serializable;
import java.time.Instant;

public record NotificationPayload(
    String title,
    String message,
    String type,
    Object data,
    Instant timestamp
) implements Serializable {
    public static NotificationPayload info(String title, String message, Object data) {
        return new NotificationPayload(title, message, "INFO", data, Instant.now());
    }
}
