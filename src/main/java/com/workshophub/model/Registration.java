package com.workshophub.model;

import com.workshophub.model.enums.PaymentStatus;
import com.workshophub.model.enums.PricingType;
import com.workshophub.model.enums.RegistrationStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document representing a participant's registration for a workshop.
 * A compound index on (workshopId, participantId, status) enforces uniqueness for CONFIRMED status.
 */
@Document(collection = "registrations")
@CompoundIndex(name = "unique_active_reg", def = "{'workshopId': 1, 'participantId': 1, 'status': 1}")
public class Registration {

    @Id
    private String id;

    @Indexed
    private String workshopId;

    @Indexed
    private String participantId;

    // Denormalized snapshots for fast table rendering without N+1 queries
    private String participantName;

    @Indexed
    private String participantEmail;

    private LocalDateTime registeredAt;
    private RegistrationStatus status;
    private LocalDateTime updatedAt;
    private String notes;

    // Single-use QR Verification fields
    @Indexed
    private String ticketCode;
    private boolean verified;
    private LocalDateTime verifiedAt;
    private String verifiedBy;

    // Pricing Snapshot & Payment Fields
    private PricingType pricingTypeSnapshot = PricingType.FREE;
    private Double amount = 0.0;
    private String currency = "INR";
    private PaymentStatus paymentStatus = PaymentStatus.NOT_REQUIRED;
    private String paymentAttemptId;
    @Indexed
    private String razorpayOrderId;
    @Indexed
    private String razorpayPaymentId;
    private LocalDateTime reservationExpiresAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime cancelledAt;

    public Registration() {
        this.registeredAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = RegistrationStatus.CONFIRMED;
    }

    public Registration(String workshopId, String participantId, String participantName, String participantEmail) {
        this();
        this.workshopId = workshopId;
        this.participantId = participantId;
        this.participantName = participantName;
        this.participantEmail = participantEmail;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getWorkshopId() { return workshopId; }
    public void setWorkshopId(String workshopId) { this.workshopId = workshopId; }

    public String getParticipantId() { return participantId; }
    public void setParticipantId(String participantId) { this.participantId = participantId; }

    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }

    public String getParticipantEmail() { return participantEmail; }
    public void setParticipantEmail(String participantEmail) { this.participantEmail = participantEmail; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }

    public RegistrationStatus getStatus() { return status; }
    public void setStatus(RegistrationStatus status) { this.status = status; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getTicketCode() { return ticketCode; }
    public void setTicketCode(String ticketCode) { this.ticketCode = ticketCode; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public PricingType getPricingTypeSnapshot() { return pricingTypeSnapshot != null ? pricingTypeSnapshot : PricingType.FREE; }
    public void setPricingTypeSnapshot(PricingType pricingTypeSnapshot) { this.pricingTypeSnapshot = pricingTypeSnapshot; }

    public Double getAmount() { return amount != null ? amount : 0.0; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency != null ? currency : "INR"; }
    public void setCurrency(String currency) { this.currency = currency; }

    public PaymentStatus getPaymentStatus() { return paymentStatus != null ? paymentStatus : PaymentStatus.NOT_REQUIRED; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentAttemptId() { return paymentAttemptId; }
    public void setPaymentAttemptId(String paymentAttemptId) { this.paymentAttemptId = paymentAttemptId; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public LocalDateTime getReservationExpiresAt() { return reservationExpiresAt; }
    public void setReservationExpiresAt(LocalDateTime reservationExpiresAt) { this.reservationExpiresAt = reservationExpiresAt; }

    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
}
