package com.ams.backend.storage;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
public class FileStorageService {
    private final String uploadDir;
    public FileStorageService(String uploadDir) {
        this.uploadDir = uploadDir;
// Create directory if not exists
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }
    public String uploadFile(String fileName, byte[] fileData) {
        try {
            String filePath = uploadDir + File.separator + fileName;
            Files.write(Paths.get(filePath), fileData);
            System.out.println("✅ File uploaded: " + fileName);
            return filePath;
        } catch (IOException e) {
            System.out.println("❌ File upload failed: " + e.getMessage());
            return null;
        }
    }
    public byte[] downloadFile(String fileName) {try {
        String filePath = uploadDir + File.separator + fileName;
        return Files.readAllBytes(Paths.get(filePath));
    } catch (IOException e) {
        System.out.println("❌ File download failed: " + e.getMessage());
        return null;
    }
    }
    public boolean deleteFile(String fileName) {
        try {
            String filePath = uploadDir + File.separator + fileName;
            return Files.deleteIfExists(Paths.get(filePath));
        } catch (IOException e) {
            System.out.println("❌ File deletion failed: " + e.getMessage());
            return false;
        }
    }
    public boolean fileExists(String fileName) {
        String filePath = uploadDir + File.separator + fileName;
        return Files.exists(Paths.get(filePath));
    }
    public long getFileSize(String fileName) {
        try {
            String filePath = uploadDir + File.separator + fileName;
            return Files.size(Paths.get(filePath));
        } catch (IOException e) {
            return -1;
        }
    }
}