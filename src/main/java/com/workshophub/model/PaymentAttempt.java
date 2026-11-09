package com.workshophub.model;

import com.workshophub.model.enums.PaymentStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document representing a paid registration attempt and Razorpay checkout transaction.
 */
@Document(collection = "payment_attempts")
public class PaymentAttempt {

    @Id
    private String id;

    @Indexed
    private String registrationId;

    @Indexed
    private String workshopId;
    private String workshopTitle;

    @Indexed
    private String participantId;
    private String participantName;
    private String participantEmail;

    @Indexed(unique = true, sparse = true)
    private String razorpayOrderId;

    @Indexed(sparse = true)
    private String razorpayPaymentId;

    private long amount; // in paise (e.g. 49900 for ₹499)
    private Double amountInRupees; // e.g. 499.0
    private String currency = "INR";

    private PaymentStatus status;
    private boolean signatureVerified;
    private boolean webhookVerified;
    private String failureReason;
    private String idempotencyKey;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;

    public PaymentAttempt() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = PaymentStatus.CREATED;
        this.currency = "INR";
    }

    public PaymentAttempt(String id, String registrationId, String workshopId, String workshopTitle,
                          String participantId, String participantName, String participantEmail,
                          long amount, Double amountInRupees) {
        this();
        this.id = id;
        this.registrationId = registrationId;
        this.workshopId = workshopId;
        this.workshopTitle = workshopTitle;
        this.participantId = participantId;
        this.participantName = participantName;
        this.participantEmail = participantEmail;
        this.amount = amount;
        this.amountInRupees = amountInRupees;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRegistrationId() { return registrationId; }
    public void setRegistrationId(String registrationId) { this.registrationId = registrationId; }

    public String getWorkshopId() { return workshopId; }
    public void setWorkshopId(String workshopId) { this.workshopId = workshopId; }

    public String getWorkshopTitle() { return workshopTitle; }
    public void setWorkshopTitle(String workshopTitle) { this.workshopTitle = workshopTitle; }

    public String getParticipantId() { return participantId; }
    public void setParticipantId(String participantId) { this.participantId = participantId; }

    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }

    public String getParticipantEmail() { return participantEmail; }
    public void setParticipantEmail(String participantEmail) { this.participantEmail = participantEmail; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public long getAmount() { return amount; }
    public void setAmount(long amount) { this.amount = amount; }

    public Double getAmountInRupees() { return amountInRupees; }
    public void setAmountInRupees(Double amountInRupees) { this.amountInRupees = amountInRupees; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public boolean isSignatureVerified() { return signatureVerified; }
    public void setSignatureVerified(boolean signatureVerified) { this.signatureVerified = signatureVerified; }

    public boolean isWebhookVerified() { return webhookVerified; }
    public void setWebhookVerified(boolean webhookVerified) { this.webhookVerified = webhookVerified; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
}

