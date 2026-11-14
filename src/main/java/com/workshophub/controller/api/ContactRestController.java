package com.workshophub.controller.api;

import com.workshophub.model.AuditLog;
import com.workshophub.repository.AuditLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST API for academic inquiries and campus deployment contact submissions.
 */
@RestController
@RequestMapping("/api/contact")
public class ContactRestController {

    private final AuditLogRepository auditLogRepository;

    public ContactRestController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public static class ContactRequest {
        private String name;
        private String email;
        private String message;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    @PostMapping
    public ResponseEntity<?> submitContactMessage(@RequestBody ContactRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty() ||
            request.getEmail() == null || !request.getEmail().contains("@") ||
            request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("error", "Please provide your name, a valid email address, and an inquiry message.");
            return ResponseEntity.badRequest().body(err);
        }

        try {
            // Persist contact submission as an administrative audit/inquiry record
            AuditLog inquiryLog = new AuditLog(
                request.getEmail().trim().toLowerCase(),
                request.getName().trim(),
                "CONTACT_INQUIRY",
                "USER",
                "INQUIRY-" + System.currentTimeMillis(),
                "Inquiry from " + request.getName().trim() + " (" + request.getEmail().trim() + "): " + request.getMessage().trim()
            );
            auditLogRepository.save(inquiryLog);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thank you for contacting Kaushalya. Our campus coordination team will get back to you shortly.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("error", "Unable to submit your message at this time. Please try again shortly.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }
}
