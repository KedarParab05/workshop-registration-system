package com.workshophub.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document storing received Razorpay webhook events for deduplication and audit.
 */
@Document(collection = "webhook_events")
public class WebhookEvent {

    @Id
    private String id;

    @Indexed(unique = true, sparse = true)
    private String eventId;

    private String eventType;
    private String payload;
    private boolean signatureVerified;
    private boolean processed;
    private String processResult;
    private LocalDateTime receivedAt;

    public WebhookEvent() {
        this.receivedAt = LocalDateTime.now();
    }

    public WebhookEvent(String eventId, String eventType, String payload, boolean signatureVerified) {
        this();
        this.eventId = eventId;
        this.eventType = eventType;
        this.payload = payload;
        this.signatureVerified = signatureVerified;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }

    public boolean isSignatureVerified() { return signatureVerified; }
    public void setSignatureVerified(boolean signatureVerified) { this.signatureVerified = signatureVerified; }

    public boolean isProcessed() { return processed; }
    public void setProcessed(boolean processed) { this.processed = processed; }

    public String getProcessResult() { return processResult; }
    public void setProcessResult(String processResult) { this.processResult = processResult; }

    public LocalDateTime getReceivedAt() { return receivedAt; }
    public void setReceivedAt(LocalDateTime receivedAt) { this.receivedAt = receivedAt; }
}

