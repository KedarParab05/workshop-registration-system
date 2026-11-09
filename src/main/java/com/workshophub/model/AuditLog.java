package com.workshophub.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document for system security and administrative audit logs.
 */
@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    private String actorUserId;
    private String actorName;
    private String action;
    private String entityType;
    private String entityId;
    private LocalDateTime createdAt;
    private String shortDescription;

    public AuditLog() {
        this.createdAt = LocalDateTime.now();
    }

    public AuditLog(String actorUserId, String actorName, String action, String entityType, String entityId, String shortDescription) {
        this();
        this.actorUserId = actorUserId;
        this.actorName = actorName;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.shortDescription = shortDescription;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getActorUserId() { return actorUserId; }
    public void setActorUserId(String actorUserId) { this.actorUserId = actorUserId; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
}
