package com.workshophub.model;

import com.workshophub.model.enums.PricingType;
import com.workshophub.model.enums.WorkshopStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB document representing an academic workshop session.
 * All workshops on WorkshopHub are completely free (zero payment fields).
 */
@Document(collection = "workshops")
public class Workshop {

    @Id
    private String id;

    private String title;
    private String summary;
    private String description;
    private String category;

    // Image Storage Reference
    private String bannerImageUrl;
    private String bannerImagePublicId;

    // Organizer Reference
    @Indexed
    private String organizerId;
    private String organizerNameSnapshot;

    // Schedule & Logistics
    private String date; // YYYY-MM-DD
    private String startTime; // HH:mm
    private String endTime; // HH:mm
    private String venue;
    private String venueAddress;
    private Double latitude;
    private Double longitude;
    private String mapUrl;
    private boolean onlineMode;
    private String meetingLink;

    // Capacity & Constraints
    private int capacity;
    private String registrationDeadline;
    private List<String> learningOutcomes = new ArrayList<>();

    private WorkshopStatus status;

    // Pricing & Registration Configuration (Free / Paid)
    private PricingType pricingType = PricingType.FREE;
    private Double price = 0.0;
    private String currency = "INR";
    private LocalDateTime pricingUpdatedAt;
    private String pricingUpdatedBy;

    // Organizer Payment Credentials
    private String payeeVpa;
    private String payeeName;
    private String razorpayKeyId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Workshop() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = WorkshopStatus.PUBLISHED;
        this.capacity = 30;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBannerImageUrl() { return bannerImageUrl; }
    public void setBannerImageUrl(String bannerImageUrl) { this.bannerImageUrl = bannerImageUrl; }

    public String getBannerImagePublicId() { return bannerImagePublicId; }
    public void setBannerImagePublicId(String bannerImagePublicId) { this.bannerImagePublicId = bannerImagePublicId; }

    public String getOrganizerId() { return organizerId; }
    public void setOrganizerId(String organizerId) { this.organizerId = organizerId; }

    public String getOrganizerNameSnapshot() { return organizerNameSnapshot; }
    public void setOrganizerNameSnapshot(String organizerNameSnapshot) { this.organizerNameSnapshot = organizerNameSnapshot; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getVenueAddress() { return venueAddress; }
    public void setVenueAddress(String venueAddress) { this.venueAddress = venueAddress; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getMapUrl() { return mapUrl; }
    public void setMapUrl(String mapUrl) { this.mapUrl = mapUrl; }

    public boolean isOnlineMode() { return onlineMode; }
    public void setOnlineMode(boolean onlineMode) { this.onlineMode = onlineMode; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public String getRegistrationDeadline() { return registrationDeadline; }
    public void setRegistrationDeadline(String registrationDeadline) { this.registrationDeadline = registrationDeadline; }

    public List<String> getLearningOutcomes() { return learningOutcomes; }
    public void setLearningOutcomes(List<String> learningOutcomes) { this.learningOutcomes = learningOutcomes; }

    public WorkshopStatus getStatus() { return status; }
    public void setStatus(WorkshopStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public PricingType getPricingType() { return pricingType != null ? pricingType : PricingType.FREE; }
    public void setPricingType(PricingType pricingType) { this.pricingType = pricingType; }

    public Double getPrice() { return price != null ? price : 0.0; }
    public void setPrice(Double price) { this.price = price; }

    public String getCurrency() { return currency != null ? currency : "INR"; }
    public void setCurrency(String currency) { this.currency = currency; }

    public LocalDateTime getPricingUpdatedAt() { return pricingUpdatedAt; }
    public void setPricingUpdatedAt(LocalDateTime pricingUpdatedAt) { this.pricingUpdatedAt = pricingUpdatedAt; }

    public String getPricingUpdatedBy() { return pricingUpdatedBy; }
    public void setPricingUpdatedBy(String pricingUpdatedBy) { this.pricingUpdatedBy = pricingUpdatedBy; }

    public String getPayeeVpa() { return payeeVpa; }
    public void setPayeeVpa(String payeeVpa) { this.payeeVpa = payeeVpa; }

    public String getPayeeName() { return payeeName; }
    public void setPayeeName(String payeeName) { this.payeeName = payeeName; }

    public String getRazorpayKeyId() { return razorpayKeyId; }
    public void setRazorpayKeyId(String razorpayKeyId) { this.razorpayKeyId = razorpayKeyId; }
}
