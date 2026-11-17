package com.workshophub.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Centralized service for Cloudinary Image Storage and CDN delivery.
 * Encapsulates secure upload, automated responsive optimization (f_auto, q_auto),
 * format validation, file-size enforcement, and lifecycle image deletion.
 */
@Service
public class ImageStorageService {

    private static final Logger log = LoggerFactory.getLogger(ImageStorageService.class);

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    @Value("${cloudinary.cloud_name:}")
    private String cloudName;

    @Value("${cloudinary.api_key:}")
    private String apiKey;

    @Value("${cloudinary.api_secret:}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        if (cloudName != null && !cloudName.isBlank() &&
            apiKey != null && !apiKey.isBlank() &&
            apiSecret != null && !apiSecret.isBlank()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName.trim(),
                    "api_key", apiKey.trim(),
                    "api_secret", apiSecret.trim(),
                    "secure", true
            ));
            log.info("Cloudinary CDN initialized successfully for cloud: {}", cloudName.trim());
        } else {
            log.warn("Cloudinary credentials incomplete; running with mock fallback storage.");
        }
    }

    /**
     * Securely uploads an image to Cloudinary in an organized category folder.
     * Enforces format validation (JPEG, PNG, WebP) and maximum 5MB size limit.
     */
    public Map<String, Object> uploadImage(MultipartFile file, String subfolder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select an image file to upload.");
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Only JPG, JPEG, PNG, and WebP images are allowed.");
        }

        // Enforce 5MB file-size limit
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Image size must not exceed 5MB.");
        }

        String safeSubfolder = (subfolder != null && !subfolder.isBlank())
                ? subfolder.trim().replaceAll("[^a-zA-Z0-9_-]", "")
                : "general";

        String folderPath = "kaushalya/" + safeSubfolder;

        if (cloudinary != null) {
            Map<?, ?> uploadParams = ObjectUtils.asMap(
                    "folder", folderPath,
                    "resource_type", "image",
                    "quality", "auto",
                    "fetch_format", "auto"
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), uploadParams);

            String secureUrl = (String) result.get("secure_url");
            String publicId = (String) result.get("public_id");
            String format = (String) result.get("format");
            Number bytes = (Number) result.get("bytes");

            Map<String, Object> response = new HashMap<>();
            response.put("url", secureUrl);
            response.put("publicId", publicId);
            response.put("format", format);
            response.put("bytes", bytes != null ? bytes.longValue() : file.getSize());
            response.put("folder", folderPath);

            log.info("Uploaded image to Cloudinary: {} (public_id: {})", secureUrl, publicId);
            return response;
        } else {
            // Local fallback if credentials unavailable
            String fallbackId = "kaushalya/" + safeSubfolder + "/local_" + System.currentTimeMillis();
            return Map.of(
                    "url", "/assets/images/fullstack-web-workshop-banner.jpg",
                    "publicId", fallbackId,
                    "format", "jpg",
                    "bytes", file.getSize(),
                    "folder", folderPath
            );
        }
    }

    /**
     * Backward-compatible convenience wrapper for workshop banner uploads.
     */
    public Map<String, String> uploadBanner(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return Map.of(
                    "url", "/assets/images/fullstack-web-workshop-banner.jpg",
                    "public_id", "default_banner"
            );
        }
        Map<String, Object> res = uploadImage(file, "banners");
        return Map.of(
                "url", (String) res.get("url"),
                "public_id", (String) res.get("publicId")
        );
    }

    public boolean deleteBanner(String publicId) {
        return deleteImage(publicId);
    }

    /**
     * Deletes an image from Cloudinary by its public ID to prevent orphaned storage.
     */
    public boolean deleteImage(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return false;
        }

        if (cloudinary != null) {
            try {
                Map<?, ?> result = cloudinary.uploader().destroy(publicId.trim(), ObjectUtils.emptyMap());
                String status = (String) result.get("result");
                log.info("Deleted image from Cloudinary: {} (result: {})", publicId, status);
                return "ok".equalsIgnoreCase(status);
            } catch (Exception e) {
                log.error("Failed to delete image from Cloudinary: {}", publicId, e);
                return false;
            }
        }
        return true;
    }
}
