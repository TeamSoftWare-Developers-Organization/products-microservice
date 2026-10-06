package com.skystore.media.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPReply;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Service
public class FtpStorageService {

    @Value("${app.ftp.host:localhost}")
    private String host;

    @Value("${app.ftp.port:21}")
    private int port;

    @Value("${app.ftp.username:sky_ftp}")
    private String username;

    @Value("${app.ftp.password:sky_ftp_secure_2026}")
    private String password;

    @Value("${app.ftp.base-path:/}")
    private String basePath;

    /**
     * إنشاء اتصال نشط مع خادم FTP وضبط الوضع الخامل والترميز الثنائي
     */
    private FTPClient createFtpClient() throws IOException {
        FTPClient ftpClient = new FTPClient();
        ftpClient.setConnectTimeout(10000);
        ftpClient.setDataTimeout(30000);

        log.info("Connecting to FTP server at {}:{}", host, port);
        ftpClient.connect(host, port);

        int replyCode = ftpClient.getReplyCode();
        if (!FTPReply.isPositiveCompletion(replyCode)) {
            ftpClient.disconnect();
            throw new IOException("FTP server refused connection with reply code: " + replyCode);
        }

        boolean loggedIn = ftpClient.login(username, password);
        if (!loggedIn) {
            ftpClient.disconnect();
            throw new IOException("Failed to authenticate with FTP server for user: " + username);
        }

        ftpClient.enterLocalPassiveMode();
        ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
        ftpClient.setControlKeepAliveTimeout(300);

        return ftpClient;
    }

    /**
     * قطع الاتصال بالخادم بأمان
     */
    private void disconnectFtpClient(FTPClient ftpClient) {
        if (ftpClient != null && ftpClient.isConnected()) {
            try {
                ftpClient.logout();
                ftpClient.disconnect();
            } catch (IOException e) {
                log.warn("Error while disconnecting from FTP server: {}", e.getMessage());
            }
        }
    }

    /**
     * رفع ملف إلى خادم FTP عبر InputStream
     */
    public boolean uploadFile(String remoteFileName, InputStream inputStream) {
        FTPClient ftpClient = null;
        try {
            ftpClient = createFtpClient();
            createDirectoriesIfNotExist(ftpClient, remoteFileName);

            String fullPath = normalizePath(remoteFileName);
            log.info("Uploading file to FTP: {}", fullPath);

            boolean success = ftpClient.storeFile(fullPath, inputStream);
            if (!success) {
                log.error("Failed to store file on FTP server: {}", fullPath);
            }
            return success;
        } catch (IOException e) {
            log.error("Error uploading file to FTP: {}", e.getMessage(), e);
            return false;
        } finally {
            disconnectFtpClient(ftpClient);
        }
    }

    /**
     * رفع مصفوفة بايتات (مخرجات محرك الصور أو ملفات دفعية) مباشرة إلى خادم FTP
     */
    public boolean uploadBytes(String remoteFileName, byte[] data) {
        try (InputStream inputStream = new ByteArrayInputStream(data)) {
            return uploadFile(remoteFileName, inputStream);
        } catch (IOException e) {
            log.error("Error creating ByteArrayInputStream for FTP upload: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * تنزيل ملف من خادم FTP كـ Byte Array
     */
    public byte[] downloadFile(String remoteFileName) {
        FTPClient ftpClient = null;
        try {
            ftpClient = createFtpClient();
            String fullPath = normalizePath(remoteFileName);
            log.info("Downloading file from FTP: {}", fullPath);

            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                boolean success = ftpClient.retrieveFile(fullPath, outputStream);
                if (success) {
                    return outputStream.toByteArray();
                } else {
                    log.error("Failed to retrieve file from FTP: {}", fullPath);
                    return null;
                }
            }
        } catch (IOException e) {
            log.error("Error downloading file from FTP: {}", e.getMessage(), e);
            return null;
        } finally {
            disconnectFtpClient(ftpClient);
        }
    }

    /**
     * حذف ملف من خادم FTP
     */
    public boolean deleteFile(String remoteFileName) {
        FTPClient ftpClient = null;
        try {
            ftpClient = createFtpClient();
            String fullPath = normalizePath(remoteFileName);
            log.info("Deleting file from FTP: {}", fullPath);
            return ftpClient.deleteFile(fullPath);
        } catch (IOException e) {
            log.error("Error deleting file from FTP: {}", e.getMessage(), e);
            return false;
        } finally {
            disconnectFtpClient(ftpClient);
        }
    }

    /**
     * التحقق من سلامة الاتصال بخادم FTP
     */
    public boolean isConnected() {
        FTPClient ftpClient = null;
        try {
            ftpClient = createFtpClient();
            return ftpClient.sendNoOp();
        } catch (Exception e) {
            log.warn("FTP health check failed: {}", e.getMessage());
            return false;
        } finally {
            disconnectFtpClient(ftpClient);
        }
    }

    private String normalizePath(String path) {
        String base = basePath.endsWith("/") ? basePath : basePath + "/";
        String cleanPath = path.startsWith("/") ? path.substring(1) : path;
        return base + cleanPath;
    }

    private void createDirectoriesIfNotExist(FTPClient ftpClient, String remoteFilePath) throws IOException {
        String[] pathParts = remoteFilePath.split("/");
        if (pathParts.length <= 1) {
            return;
        }

        StringBuilder currentPath = new StringBuilder();
        for (int i = 0; i < pathParts.length - 1; i++) {
            if (!pathParts[i].isEmpty()) {
                currentPath.append("/").append(pathParts[i]);
                ftpClient.makeDirectory(currentPath.toString());
            }
        }
    }
}
