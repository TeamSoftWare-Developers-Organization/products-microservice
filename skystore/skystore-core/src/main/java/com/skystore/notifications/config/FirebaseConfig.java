package com.skystore.notifications.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.service-account.path:classpath:firebase-service-account.json}")
    private Resource serviceAccountResource;

    @PostConstruct
    public void initializeFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                if (serviceAccountResource != null && serviceAccountResource.exists()) {
                    try (InputStream serviceAccount = serviceAccountResource.getInputStream()) {
                        FirebaseOptions options = FirebaseOptions.builder()
                                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                                .build();
                        FirebaseApp.initializeApp(options);
                        log.info("🚀 تم تهيئة Firebase Admin SDK بنجاح عبر ملف الاعتماد.");
                    }
                } else {
                    log.warn("⚠️ لم يتم العثور على ملف اعتماد Firebase ({})، سيعمل محول FCM في وضع التطوير المحلي التوضيحي (Simulation Mode).", serviceAccountResource);
                }
            }
        } catch (Exception e) {
            log.error("خطأ أثناء محاولة تهيئة Firebase App: {}", e.getMessage(), e);
        }
    }
}
