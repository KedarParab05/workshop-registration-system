package com.workshophub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

/**
 * Service encapsulating Razorpay Test Mode REST API communication and HMAC-SHA256 cryptographic verification.
 * Keeps all Razorpay Key Secrets strictly server-side.
 */
@Service
public class RazorpayService {

    @Value("${razorpay.key.id:}")
    private String keyId;

    @Value("${razorpay.key.secret:}")
    private String keySecret;

    @Value("${razorpay.webhook.secret:kaushalya_whsec_test2026}")
    private String webhookSecret;

    @Value("${razorpay.mode:test}")
    private String mode;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @PostConstruct
    public void init() {
        if (keyId != null) keyId = keyId.trim();
        if (keySecret != null) keySecret = keySecret.trim();
        if (webhookSecret != null) webhookSecret = webhookSecret.trim();
        if (mode != null) mode = mode.trim();

        if (isConfigured()) {
            String maskedKey = keyId.length() > 8 ? keyId.substring(0, 8) + "..." : keyId;
            System.out.println("[RazorpayService] Initialized with Key: " + maskedKey + " | Mode: " + mode);
        } else {
            System.out.println("[RazorpayService] Notice: Razorpay credentials not configured via environment variables.");
        }
    }

    public String getKeyId() {
        return keyId;
    }

    public String getMode() {
        return mode;
    }

    public boolean isConfigured() {
        return keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank();
    }

    /**
     * Queries Razorpay API to fetch all payments for a given order ID.
     */
    public java.util.List<Map<String, Object>> fetchOrderPayments(String orderId) {
        if (!isConfigured() || orderId == null || orderId.isBlank() || orderId.startsWith("order_test_")) {
            return java.util.Collections.emptyList();
        }
        try {
            String auth = Base64.getEncoder().encodeToString((keyId + ":" + keySecret).getBytes(StandardCharsets.UTF_8));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.razorpay.com/v1/orders/" + orderId + "/payments"))
                    .header("Authorization", "Basic " + auth)
                    .GET()
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.has("items") && root.get("items").isArray()) {
                    java.util.List<Map<String, Object>> result = new java.util.ArrayList<>();
                    for (JsonNode item : root.get("items")) {
                        Map<String, Object> map = new java.util.HashMap<>();
                        if (item.has("id")) map.put("id", item.get("id").asText());
                        if (item.has("status")) map.put("status", item.get("status").asText());
                        if (item.has("amount")) map.put("amount", item.get("amount").asLong());
                        result.add(map);
                    }
                    return result;
                }
            }
        } catch (Exception e) {
            System.err.println("[RazorpayService] Error querying payments for order " + orderId + ": " + e.getMessage());
        }
        return java.util.Collections.emptyList();
    }

    /**
     * Creates a new Razorpay Order for a paid workshop session.
     *
     * @param amountInPaise The total payable amount in integer paise (e.g. 49900 for ₹499)
     * @param currency      Currency code (e.g. "INR")
     * @param receiptId     Internal receipt reference (e.g. "rcpt_PAY-1234")
     * @param notes         Non-sensitive metadata notes
     * @return Razorpay Order ID (e.g. "order_P1a2b3c4d5")
     */
    public String createOrder(long amountInPaise, String currency, String receiptId, Map<String, String> notes) throws Exception {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            throw new IllegalStateException("Razorpay credentials are not configured on the backend.");
        }

        Map<String, Object> requestPayload = Map.of(
                "amount", amountInPaise,
                "currency", currency != null ? currency : "INR",
                "receipt", receiptId != null ? receiptId : "rcpt_" + System.currentTimeMillis(),
                "payment_capture", 1, // Auto-capture payments
                "notes", notes != null ? notes : Map.of()
        );

        String jsonBody = objectMapper.writeValueAsString(requestPayload);
        String authHeader = "Basic " + Base64.getEncoder().encodeToString((keyId + ":" + keySecret).getBytes(StandardCharsets.UTF_8));

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.razorpay.com/v1/orders"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", authHeader)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.has("id")) {
                    return root.get("id").asText();
                }
            }

            // If Razorpay API returned an error response
            JsonNode errorNode = objectMapper.readTree(response.body());
            String errorDesc = errorNode.path("error").path("description").asText("Failed to create order with Razorpay.");
            System.err.println("[RazorpayService] Order creation error (" + response.statusCode() + "): " + errorDesc);
            throw new IllegalStateException("Razorpay Order Creation Failed: " + errorDesc);
        } catch (Exception e) {
            System.err.println("[RazorpayService] Connection exception during order creation: " + e.getMessage());
            throw new IllegalStateException("Failed to communicate with Razorpay payment gateway: " + e.getMessage(), e);
        }
    }

    /**
     * Verifies the cryptographic HMAC-SHA256 signature generated during Razorpay Checkout.
     * signature = HmacSHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
     */
    public boolean verifyCheckoutSignature(String orderId, String paymentId, String signature) {
        if (orderId == null || paymentId == null || signature == null || keySecret == null || keySecret.isBlank()) {
            return false;
        }

        try {
            String payload = orderId.trim() + "|" + paymentId.trim();
            String expectedSignature = calculateHmacSha256(payload, keySecret);
            return MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    signature.trim().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            System.err.println("[RazorpayService] Signature verification exception: " + e.getMessage());
            return false;
        }
    }

    /**
     * Verifies a Razorpay Webhook signature using the raw webhook request body and the secret.
     */
    public boolean verifyWebhookSignature(String rawBody, String signatureHeader) {
        if (rawBody == null || signatureHeader == null || webhookSecret == null || webhookSecret.isBlank()) {
            return false;
        }

        try {
            String expectedSignature = calculateHmacSha256(rawBody, webhookSecret);
            return MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    signatureHeader.trim().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            System.err.println("[RazorpayService] Webhook signature verification exception: " + e.getMessage());
            return false;
        }
    }

    /**
     * Generates HMAC-SHA256 hex string using Java 17 HexFormat.
     */
    public static String calculateHmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(rawHmac);
    }
}

