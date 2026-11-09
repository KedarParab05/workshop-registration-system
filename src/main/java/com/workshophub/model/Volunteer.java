package com.workshophub.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document representing a Gate Volunteer appointed by an Organizer.
 * Gate Volunteers verify participant tickets at workshop entrances using an Access Code.
 */
@Document(collection = "volunteers")
public class Volunteer {

    @Id
    private String id;

    private String name;

    private String email;

    private String phoneNumber;

    @Indexed
    private String organizerId;

    private String organizerName;

    @Indexed
    private String assignedWorkshopId;

    private String assignedWorkshopTitle;

    @Indexed(unique = true)
    private String accessCode; // e.g. "VOL-849201"

    private String status; // "PENDING_APPROVAL", "ACTIVE", "REVOKED", "REJECTED"

    private String requestNote;

    private LocalDateTime createdAt;

    private LocalDateTime lastActiveAt;

    private int totalScanned;

    public Volunteer() {
        this.createdAt = LocalDateTime.now();
        this.status = "ACTIVE";
        this.totalScanned = 0;
    }

    public Volunteer(String name, String email, String organizerId, String organizerName,
                     String assignedWorkshopId, String assignedWorkshopTitle, String accessCode) {
        this();
        this.name = name;
        this.email = email;
        this.organizerId = organizerId;
        this.organizerName = organizerName;
        this.assignedWorkshopId = assignedWorkshopId;
        this.assignedWorkshopTitle = assignedWorkshopTitle;
        this.accessCode = accessCode;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getOrganizerId() { return organizerId; }
    public void setOrganizerId(String organizerId) { this.organizerId = organizerId; }

    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }

    public String getAssignedWorkshopId() { return assignedWorkshopId; }
    public void setAssignedWorkshopId(String assignedWorkshopId) { this.assignedWorkshopId = assignedWorkshopId; }

    public String getAssignedWorkshopTitle() { return assignedWorkshopTitle; }
    public void setAssignedWorkshopTitle(String assignedWorkshopTitle) { this.assignedWorkshopTitle = assignedWorkshopTitle; }

    public String getAccessCode() { return accessCode; }
    public void setAccessCode(String accessCode) { this.accessCode = accessCode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(LocalDateTime lastActiveAt) { this.lastActiveAt = lastActiveAt; }

    public String getRequestNote() { return requestNote; }
    public void setRequestNote(String requestNote) { this.requestNote = requestNote; }

    public int getTotalScanned() { return totalScanned; }
    public void setTotalScanned(int totalScanned) { this.totalScanned = totalScanned; }

    public void incrementScanned() {
        this.totalScanned++;
        this.lastActiveAt = LocalDateTime.now();
    }
}

