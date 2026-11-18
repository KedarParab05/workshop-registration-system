package com.workshophub.service;

import com.workshophub.model.AuditLog;
import com.workshophub.model.User;
import com.workshophub.model.Workshop;
import com.workshophub.model.enums.PricingType;
import com.workshophub.model.enums.RegistrationStatus;
import com.workshophub.model.enums.UserRole;
import com.workshophub.model.enums.WorkshopStatus;
import com.workshophub.repository.AuditLogRepository;
import com.workshophub.repository.RegistrationRepository;
import com.workshophub.repository.WorkshopRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service managing Workshop CRUD operations and business validation rules.
 */
@Service
public class WorkshopService {

    private final WorkshopRepository workshopRepository;
    private final RegistrationRepository registrationRepository;
    private final AuditLogRepository auditLogRepository;
    private final ImageStorageService imageStorageService;

    public WorkshopService(WorkshopRepository workshopRepository,
                           RegistrationRepository registrationRepository,
                           AuditLogRepository auditLogRepository,
                           ImageStorageService imageStorageService) {
        this.workshopRepository = workshopRepository;
        this.registrationRepository = registrationRepository;
        this.auditLogRepository = auditLogRepository;
        this.imageStorageService = imageStorageService;
    }

    public List<Workshop> findAllPublished() {
        return workshopRepository.findByStatus(WorkshopStatus.PUBLISHED);
    }

    public List<Workshop> findAll() {
        return workshopRepository.findAll();
    }

    public List<Workshop> findByOrganizerId(String organizerId) {
        return workshopRepository.findByOrganizerId(organizerId);
    }

    public Optional<Workshop> findById(String id) {
        return workshopRepository.findById(id);
    }

    public long getActiveAttendeeCount(String workshopId) {
        return registrationRepository.countByWorkshopIdAndStatus(workshopId, RegistrationStatus.CONFIRMED);
    }

    public int getAvailableSeats(Workshop workshop) {
        long confirmed = getActiveAttendeeCount(workshop.getId());
        return Math.max(0, workshop.getCapacity() - (int) confirmed);
    }

    public boolean isWorkshopFull(Workshop workshop) {
        long confirmed = getActiveAttendeeCount(workshop.getId());
        return confirmed >= workshop.getCapacity();
    }

    /**
     * Creates a new workshop session owned by the authenticated organizer.
     */
    public Workshop createWorkshop(Workshop workshop, User organizer) {
        if (organizer == null) {
            throw new IllegalArgumentException("Organizer must be authenticated.");
        }
        if (organizer.getRole() != UserRole.ORGANIZER && organizer.getRole() != UserRole.SUPER_ADMIN) {
            throw new SecurityException("Only organizers and administrators can create workshops.");
        }

        validateWorkshopFields(workshop);

        workshop.setOrganizerId(organizer.getId());
        workshop.setOrganizerNameSnapshot(organizer.getFullName());
        workshop.setCreatedAt(LocalDateTime.now());
        workshop.setUpdatedAt(LocalDateTime.now());

        Workshop saved = workshopRepository.save(workshop);

        auditLogRepository.save(new AuditLog(
            organizer.getId(),
            organizer.getFullName(),
            "WORKSHOP_CREATED",
            "WORKSHOP",
            saved.getId(),
            "Created workshop: " + saved.getTitle() + " (" + saved.getCapacity() + " seats)"
        ));

        return saved;
    }

    /**
     * Updates an existing workshop after validating ownership and capacity.
     */
    public Workshop updateWorkshop(String id, Workshop updatedData, User currentUser) {
        Workshop existing = workshopRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Workshop not found: " + id));

        // Authorization: any organizer or administrator can edit workshops
        if (currentUser.getRole() != UserRole.SUPER_ADMIN && currentUser.getRole() != UserRole.ORGANIZER) {
            throw new SecurityException("Access denied: You do not have permission to edit this workshop.");
        }

        validateWorkshopFields(updatedData);

        // Capacity rule: cannot reduce capacity below currently confirmed registrations
        long confirmedAttendees = getActiveAttendeeCount(id);
        if (updatedData.getCapacity() < confirmedAttendees) {
            throw new IllegalArgumentException("Cannot reduce capacity to " + updatedData.getCapacity()
                + " because " + confirmedAttendees + " participants have already registered.");
        }

        // Pricing policy: If attendees exist, keep pricing type stable
        if (confirmedAttendees > 0) {
            if (existing.getPricingType() != updatedData.getPricingType()) {
                updatedData.setPricingType(existing.getPricingType());
                if (existing.getPricingType() == PricingType.PAID && (updatedData.getPrice() == null || updatedData.getPrice() <= 0)) {
                    updatedData.setPrice(existing.getPrice());
                }
            }
        }

        existing.setTitle(updatedData.getTitle());
        existing.setSummary(updatedData.getSummary());
        existing.setDescription(updatedData.getDescription());
        existing.setCategory(updatedData.getCategory());
        if (updatedData.getBannerImageUrl() != null && !updatedData.getBannerImageUrl().isBlank()) {
            existing.setBannerImageUrl(updatedData.getBannerImageUrl());
            existing.setBannerImagePublicId(updatedData.getBannerImagePublicId());
        }
        existing.setDate(updatedData.getDate());
        existing.setStartTime(updatedData.getStartTime());
        existing.setEndTime(updatedData.getEndTime());
        existing.setVenue(updatedData.getVenue());
        existing.setVenueAddress(updatedData.getVenueAddress());
        existing.setLatitude(updatedData.getLatitude());
        existing.setLongitude(updatedData.getLongitude());
        existing.setMapUrl(updatedData.getMapUrl());
        existing.setOnlineMode(updatedData.isOnlineMode());
        existing.setMeetingLink(updatedData.getMeetingLink());
        existing.setCapacity(updatedData.getCapacity());
        existing.setRegistrationDeadline(updatedData.getRegistrationDeadline());
        existing.setLearningOutcomes(updatedData.getLearningOutcomes());
        existing.setStatus(updatedData.getStatus());
        if (updatedData.getPricingType() == PricingType.FREE || (updatedData.getPrice() != null && updatedData.getPrice() == 0.0)) {
            existing.setPricingType(PricingType.FREE);
            existing.setPrice(0.0);
        } else {
            existing.setPricingType(PricingType.PAID);
            existing.setPrice(updatedData.getPrice() != null && updatedData.getPrice() > 0 ? updatedData.getPrice() : 199.0);
        }
        existing.setCurrency(updatedData.getCurrency() != null ? updatedData.getCurrency() : "INR");
        existing.setPayeeVpa(updatedData.getPayeeVpa());
        existing.setPayeeName(updatedData.getPayeeName());
        existing.setRazorpayKeyId(updatedData.getRazorpayKeyId());
        existing.setPricingUpdatedAt(LocalDateTime.now());
        existing.setPricingUpdatedBy(currentUser.getFullName());
        existing.setUpdatedAt(LocalDateTime.now());

        return workshopRepository.save(existing);
    }

    /**
     * Safely deletes or cancels a workshop.
     * Per project requirements: If active registrations exist, transition status to CANCELLED
     * rather than deleting dependent database records.
     */
    public void deleteOrCancelWorkshop(String id, User currentUser) {
        Workshop existing = workshopRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Workshop not found: " + id));

        if (currentUser.getRole() != UserRole.SUPER_ADMIN && !existing.getOrganizerId().equals(currentUser.getId())) {
            throw new SecurityException("Access denied: You cannot delete another organizer's workshop.");
        }

        long confirmedCount = getActiveAttendeeCount(id);
        if (confirmedCount > 0) {
            // Safe fallback: mark CANCELLED to preserve attendee records
            existing.setStatus(WorkshopStatus.CANCELLED);
            existing.setUpdatedAt(LocalDateTime.now());
            workshopRepository.save(existing);
        } else {
            if (existing.getBannerImagePublicId() != null && !existing.getBannerImagePublicId().isBlank()) {
                imageStorageService.deleteImage(existing.getBannerImagePublicId());
            }
            workshopRepository.deleteById(id);
        }
    }

    private void validateWorkshopFields(Workshop workshop) {
        if (workshop.getTitle() == null || workshop.getTitle().trim().length() < 3) {
            throw new IllegalArgumentException("Workshop title must be at least 3 characters.");
        }
        if (workshop.getSummary() == null || workshop.getSummary().trim().length() < 10) {
            throw new IllegalArgumentException("Summary must be at least 10 characters.");
        }
        if (workshop.getDescription() == null || workshop.getDescription().trim().length() < 20) {
            throw new IllegalArgumentException("Description must be at least 20 characters.");
        }
        if (workshop.getCapacity() <= 0) {
            throw new IllegalArgumentException("Capacity must be at least 1.");
        }
        if (workshop.getStartTime() != null && workshop.getEndTime() != null) {
            if (workshop.getEndTime().compareTo(workshop.getStartTime()) <= 0) {
                throw new IllegalArgumentException("End time must be after start time.");
            }
        }

        // Pricing Validation: Support both FREE and PAID workshops
        if (workshop.getPricingType() == PricingType.FREE || (workshop.getPrice() != null && workshop.getPrice() == 0.0)) {
            workshop.setPricingType(PricingType.FREE);
            workshop.setPrice(0.0);
        } else {
            workshop.setPricingType(PricingType.PAID);
            if (workshop.getPrice() == null || workshop.getPrice() <= 0) {
                workshop.setPrice(199.0);
            }
            if (Double.isNaN(workshop.getPrice()) || Double.isInfinite(workshop.getPrice())) {
                throw new IllegalArgumentException("Invalid price specified.");
            }
        }
    }
}
