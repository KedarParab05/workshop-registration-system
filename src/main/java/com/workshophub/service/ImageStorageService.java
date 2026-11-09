package com.workshophub.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Service for handling workshop banner images.
 * Provides local banners and validation without external cloud dependencies.
 */
@Service
public class ImageStorageService {

    public Map<String, String> uploadBanner(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return Map.of(
                "url", "/images/banner_fullstack.jpg",
                "public_id", "default_banner"
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files (JPEG, PNG, WebP) are allowed.");
        }

        return Map.of(
            "url", "/images/banner_fullstack.jpg",
            "public_id", "local_" + System.currentTimeMillis()
        );
    }

    public boolean deleteBanner(String publicId) {
        return true;
    }
}

