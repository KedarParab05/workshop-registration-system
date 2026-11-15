package com.workshophub.controller.api;

import com.workshophub.config.JwtUtil;
import com.workshophub.model.Registration;
import com.workshophub.model.User;
import com.workshophub.service.PaymentService;
import com.workshophub.service.RazorpayService;
import com.workshophub.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

/**
 * RESTful Web Service Controller for Razorpay Test Mode checkout, signature verification,
 * webhooks, and organizer financial analytics.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentRestController {

    private final PaymentService paymentService;
    private final RazorpayService razorpayService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public PaymentRestController(PaymentService paymentService,
                                 RazorpayService razorpayService,
                                 UserService userService,
                                 JwtUtil jwtUtil) {
        this.paymentService = paymentService;
        this.razorpayService = razorpayService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    private User getAuthenticatedUser(Principal principal, String fallbackId, String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String email = jwtUtil.extractEmail(token);
                User user = userService.findByEmail(email).orElse(null);
                if (user != null) return user;
            } catch (Exception ignored) {}
        }
        if (principal != null && principal.getName() != null) {
            User user = userService.findByEmail(principal.getName()).orElse(null);
            if (user != null) return user;
        }
        if (fallbackId != null && !fallbackId.isBlank()) {
            User user = userService.findById(fallbackId).orElse(null);
            if (user != null) return user;
        }
        return null;
    }

    /**
     * GET /api/payments/config
     * Returns public checkout configuration (Key ID and Test Mode indicator).
     * Secrets are NEVER exposed.
     */
    @GetMapping("/config")
    public ResponseEntity<?> getPublicPaymentConfig() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "keyId", razorpayService.getKeyId(),
                "mode", razorpayService.getMode(),
                "currency", "INR"
        ));
    }

    /**
     * POST /api/payments/create-order
     * Creates a Razorpay order server-side for a paid workshop and reserves a seat for 15 minutes.
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body,
                                         @RequestHeader(value = "Authorization", required = false) String authHeader,
                                         Principal principal) {
        String workshopId = body != null && body.get("workshopId") != null ? body.get("workshopId").toString() : null;
        String notes = body != null && body.get("notes") != null ? body.get("notes").toString() : "";
        String fallbackParticipantId = body != null && body.get("participantId") != null ? body.get("participantId").toString() : null;

        User participant = getAuthenticatedUser(principal, fallbackParticipantId, authHeader);
        if (participant == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Please sign in to register for workshops."));
        }

        if (workshopId == null || workshopId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Workshop ID is required."));
        }

        try {
            Map<String, Object> orderDetails = paymentService.createCheckoutOrder(workshopId, participant, notes);
            return ResponseEntity.ok(orderDetails);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Failed to initiate payment: " + e.getMessage()));
        }
    }

    /**
     * POST /api/payments/verify
     * Cryptographically verifies the Razorpay signature and confirms the paid registration.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> body,
                                           @RequestHeader(value = "Authorization", required = false) String authHeader,
                                           Principal principal) {
        String paymentAttemptId = body != null && body.get("paymentAttemptId") != null ? body.get("paymentAttemptId").toString() : null;
        String razorpayOrderId = body != null && body.get("razorpay_order_id") != null ? body.get("razorpay_order_id").toString() : null;
        String razorpayPaymentId = body != null && body.get("razorpay_payment_id") != null ? body.get("razorpay_payment_id").toString() : null;
        String razorpaySignature = body != null && body.get("razorpay_signature") != null ? body.get("razorpay_signature").toString() : null;

        User currentUser = getAuthenticatedUser(principal, null, authHeader);

        try {
            Registration confirmedReg = paymentService.verifyPayment(
                    paymentAttemptId,
                    razorpayOrderId,
                    razorpayPaymentId,
                    razorpaySignature,
                    currentUser
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment verified successfully! Registration confirmed.",
                    "registration", confirmedReg
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Payment verification error: " + e.getMessage()));
        }
    }

    /**
     * GET /api/payments/status
     * Real-time polling endpoint to automatically verify if an order or attempt has been paid.
     */
    @GetMapping("/status")
    public ResponseEntity<?> checkPaymentStatus(@RequestParam(value = "orderId", required = false) String orderId,
                                                @RequestParam(value = "paymentAttemptId", required = false) String paymentAttemptId) {
        Map<String, Object> status = paymentService.checkPaymentStatus(orderId, paymentAttemptId);
        return ResponseEntity.ok(status);
    }

    /**
     * POST /api/payments/webhook
     * Handles asynchronous webhook events directly from Razorpay.
     * Signature is validated against the raw request body.
     */
    @PostMapping(value = "/webhook", consumes = "application/json")
    public ResponseEntity<?> handleWebhook(@RequestBody String rawPayload,
                                           @RequestHeader(value = "X-Razorpay-Signature", required = false) String signatureHeader) {
        if (signatureHeader == null || signatureHeader.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Missing X-Razorpay-Signature header."));
        }

        try {
            Map<String, Object> result = paymentService.processWebhook(rawPayload, signatureHeader);
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * GET /api/payments/workshop/{workshopId}
     * Returns gross revenue and paid registration analytics for Organizer Studio.
     */
    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<?> getWorkshopPaymentAnalytics(@PathVariable("workshopId") String workshopId,
                                                         @RequestHeader(value = "Authorization", required = false) String authHeader,
                                                         Principal principal) {
        User organizer = getAuthenticatedUser(principal, null, authHeader);
        if (organizer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Authentication required."));
        }

        try {
            Map<String, Object> analytics = paymentService.getWorkshopPaymentAnalytics(workshopId, organizer);
            return ResponseEntity.ok(analytics);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}

