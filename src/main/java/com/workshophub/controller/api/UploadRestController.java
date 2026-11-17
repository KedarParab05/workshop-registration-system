package com.workshophub.controller.api;

import com.workshophub.service.ImageStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * RESTful Web Service Controller for secure Cloudinary image uploads and deletions.
 * Enforces file types (JPG, PNG, WebP) and size limits server-side.
 */
@RestController
@RequestMapping("/api/uploads")
public class UploadRestController {

    private final ImageStorageService imageStorageService;

    public UploadRestController(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    /**
     * POST /api/uploads/image
     * Uploads an image file to Cloudinary and returns CDN URL + publicId metadata.
     */
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "workshops") String folder) {
        try {
            Map<String, Object> uploadResult = imageStorageService.uploadImage(file, folder);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "message", "Image uploaded successfully to Cloudinary CDN.",
                    "url", uploadResult.get("url"),
                    "publicId", uploadResult.get("publicId"),
                    "format", uploadResult.get("format"),
                    "bytes", uploadResult.get("bytes")
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "error", "Failed to upload image to cloud storage: " + e.getMessage()
            ));
        }
    }

    /**
     * DELETE /api/uploads/image
     * Removes an image from Cloudinary by its public ID.
     */
    @DeleteMapping("/image")
    public ResponseEntity<?> deleteImage(@RequestParam("publicId") String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "publicId is required."));
        }
        boolean deleted = imageStorageService.deleteImage(publicId);
        return ResponseEntity.ok(Map.of(
                "success", deleted,
                "message", deleted ? "Image removed from Cloudinary." : "Image not found or already deleted."
        ));
    }
}
