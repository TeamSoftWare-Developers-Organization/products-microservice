package com.skystore.media;

import com.skystore.media.client.RustMediaClient;
import com.skystore.media.grpc.ImageResponse;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;

@SpringBootTest
public class RustMediaIntegrationTest {

    @Autowired
    private RustMediaClient rustMediaClient;

    @Autowired
    private com.skystore.media.service.FtpStorageService ftpStorageService;

    @Test
    public void testRustImageOptimization() throws Exception {
        // إنشاء صورة تجريبية في الذاكرة بصيغة PNG
        BufferedImage img = new BufferedImage(800, 600, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setColor(Color.BLUE);
        g.fillRect(0, 0, 800, 600);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(img, "png", baos);
        byte[] rawBytes = baos.toByteArray();

        // إرسال الصورة عبر gRPC إلى محرك Rust على المنفذ 50051
        ImageResponse response = rustMediaClient.processImage("test-img-01", rawBytes, 300, 200);

        // التحقق من النتائج الصادرة من محرك Rust
        Assertions.assertNotNull(response);
        Assertions.assertEquals("test-img-01", response.getImageId());
        Assertions.assertEquals("webp", response.getFormat());
        Assertions.assertTrue(response.getOptimizedBytes().size() > 0);
        System.out.printf("✅ نجح الفحص: الحجم الأصلي: %d بايت -> الحجم بعد المعالجة بـ Rust: %d بايت (صيغة %s)%n",
                response.getOriginalSize(), response.getOptimizedSize(), response.getFormat());
    }

    @Test
    public void testPhase2RustAndFtpUpload() throws Exception {
        BufferedImage img = new BufferedImage(800, 600, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setColor(Color.MAGENTA);
        g.fillRect(0, 0, 800, 600);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(img, "png", baos);
        byte[] rawBytes = baos.toByteArray();

        ImageResponse response = rustMediaClient.processImage("prod_101", rawBytes, 300, 200);

        Assertions.assertNotNull(response);
        Assertions.assertEquals("prod_101", response.getImageId());
        Assertions.assertEquals("webp", response.getFormat());
        Assertions.assertTrue(response.getOptimizedBytes().size() > 0);
        System.out.printf("🚀 Phase 2: الحجم الأصلي: %d بايت -> الحجم بعد ضغط Rust: %d بايت (%s)%n",
                response.getOriginalSize(), response.getOptimizedSize(), response.getFormat());

        boolean uploaded = ftpStorageService.uploadBytes("/products/prod_101.webp", response.getOptimizedBytes().toByteArray());
        Assertions.assertTrue(uploaded, "فشل رفع الصورة إلى FTP");
        System.out.println("✅ تم رفع الصورة بنجاح إلى خادم FTP: /products/prod_101.webp");
    }
}
