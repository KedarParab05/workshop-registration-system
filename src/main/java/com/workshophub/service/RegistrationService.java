package com.workshophub.service;

import com.workshophub.model.AuditLog;
import com.workshophub.model.Registration;
import com.workshophub.model.User;
import com.workshophub.model.Workshop;
import com.workshophub.model.enums.AccountStatus;
import com.workshophub.model.enums.PaymentStatus;
import com.workshophub.model.enums.PricingType;
import com.workshophub.model.enums.RegistrationStatus;
import com.workshophub.model.enums.UserRole;
import com.workshophub.model.enums.WorkshopStatus;
import com.workshophub.repository.AuditLogRepository;
import com.workshophub.repository.RegistrationRepository;
import com.workshophub.repository.WorkshopRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service orchestrating free workshop registrations, capacity verification, and seat restoration.
 */
@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final WorkshopRepository workshopRepository;
    private final AuditLogRepository auditLogRepository;

    public RegistrationService(RegistrationRepository registrationRepository,
                               WorkshopRepository workshopRepository,
                               AuditLogRepository auditLogRepository) {
        this.registrationRepository = registrationRepository;
        this.workshopRepository = workshopRepository;
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Registers a participant for an upcoming free workshop.
     * Enforces:
     * 1. User is active.
     * 2. Workshop is PUBLISHED.
     * 3. No duplicate active registration exists for this user and workshop.
     * 4. Capacity limit has not been reached.
     */
    public synchronized Registration registerParticipant(String workshopId, User participant, String notes) {
        if (participant == null) {
            throw new SecurityException("Authentication required to register for workshops.");
        }
        if (participant.getAccountStatus() == AccountStatus.SUSPENDED) {
            throw new SecurityException("Your account is currently suspended. Registration blocked.");
        }

        Workshop workshop = workshopRepository.findById(workshopId)
            .orElseThrow(() -> new IllegalArgumentException("Workshop not found: " + workshopId));

        if (workshop.getStatus() != WorkshopStatus.PUBLISHED) {
            throw new IllegalStateException("Workshop is " + workshop.getStatus() + " and not accepting registrations.");
        }

        // Enforce Pricing Model: Free flow must only register for Free workshops (or workshops with price 0)
        if (workshop.getPricingType() == PricingType.PAID && workshop.getPrice() != null && workshop.getPrice() > 0) {
            throw new IllegalStateException("This is a paid workshop (₹" + workshop.getPrice() + "). Please complete checkout to register.");
        }

        // Check duplicate active registration
        Optional<Registration> existingActive = registrationRepository.findByWorkshopIdAndParticipantIdAndStatus(
            workshopId,
            participant.getId(),
            RegistrationStatus.CONFIRMED
        );
        if (existingActive.isPresent()) {
            throw new IllegalStateException("You are already registered for this workshop.");
        }

        // Check capacity
        long currentAttendees = registrationRepository.countByWorkshopIdAndStatus(workshopId, RegistrationStatus.CONFIRMED);
        if (currentAttendees >= workshop.getCapacity()) {
            throw new IllegalStateException("This workshop is fully booked (Capacity of " + workshop.getCapacity() + " reached).");
        }

        Registration reg = new Registration(
            workshopId,
            participant.getId(),
            participant.getFullName(),
            participant.getEmail()
        );
        reg.setNotes(notes);
        reg.setPricingTypeSnapshot(PricingType.FREE);
        reg.setAmount(0.0);
        reg.setCurrency("INR");
        reg.setPaymentStatus(PaymentStatus.NOT_REQUIRED);
        reg.setConfirmedAt(LocalDateTime.now());
        // Generate unique one-time QR ticket code
        String uniqueTicket = "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-" + (System.currentTimeMillis() % 10000);
        reg.setTicketCode(uniqueTicket);
        reg.setVerified(false);
        Registration saved = registrationRepository.save(reg);

        auditLogRepository.save(new AuditLog(
            participant.getId(),
            participant.getFullName(),
            "REGISTRATION_CONFIRMED",
            "REGISTRATION",
            saved.getId(),
            participant.getFullName() + " registered for free session: " + workshop.getTitle()
        ));

        return saved;
    }

    /**
     * Cancels an existing registration and frees up the seat.
     */
    public Registration cancelRegistration(String registrationId, User currentUser) {
        Registration reg = registrationRepository.findById(registrationId)
            .orElseThrow(() -> new IllegalArgumentException("Registration not found: " + registrationId));

        if (reg.getStatus() == RegistrationStatus.CANCELLED) {
            throw new IllegalStateException("This registration is already cancelled.");
        }

        // Only the participant or super admin can cancel
        if (currentUser.getRole() != UserRole.SUPER_ADMIN && !reg.getParticipantId().equals(currentUser.getId())) {
            throw new SecurityException("Access denied: You cannot cancel another user's registration.");
        }

        reg.setStatus(RegistrationStatus.CANCELLED);
        reg.setUpdatedAt(LocalDateTime.now());
        Registration saved = registrationRepository.save(reg);

        auditLogRepository.save(new AuditLog(
            currentUser.getId(),
            currentUser.getFullName(),
            "REGISTRATION_CANCELLED",
            "REGISTRATION",
            saved.getId(),
            "Cancelled booking (Seat returned to available pool)"
        ));

        return saved;
    }

    public List<Registration> findByParticipant(String participantId) {
        return registrationRepository.findByParticipantIdOrderByRegisteredAtDesc(participantId);
    }

    public List<Registration> findByWorkshop(String workshopId) {
        return registrationRepository.findByWorkshopId(workshopId);
    }

    public List<Registration> findAll() {
        return registrationRepository.findAll();
    }

    /**
     * Verifies a one-time workshop QR ticket on the day of the workshop.
     * Enforces:
     * 1. Ticket exists and is not CANCELLED.
     * 2. Single-use: Fails if already verified/used.
     * 3. Date validity: ONLY valid on the exact calendar day of the workshop.
     */
    public Registration verifyTicket(String ticketCode, User organizer, boolean allowDateBypass) {
        return verifyTicket(ticketCode, null, organizer, allowDateBypass);
    }

    /**
     * Verifies a one-time workshop QR ticket on the day of the workshop.
     * Enforces:
     * 1. Ticket exists and is not CANCELLED.
     * 2. Respective workshop check: ensures the ticket is for the workshop being conducted.
     * 3. Organizer authorization: only the hosting faculty or admin can verify attendees.
     * 4. Single-use: Fails if already verified/used.
     * 5. Date validity: ONLY valid on the exact calendar day of the workshop.
     */
    public Registration verifyTicket(String ticketCode, String targetWorkshopId, User organizer, boolean allowDateBypass) {
        if (ticketCode == null || ticketCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Ticket code is required for verification.");
        }

        final String cleanCode = ticketCode.trim();

        // 1. Locate registration by ticketCode or by ID (for legacy test data)
        Registration reg = registrationRepository.findByTicketCode(cleanCode)
                .or(() -> registrationRepository.findById(cleanCode))
                .orElseThrow(() -> new IllegalArgumentException("Invalid QR Ticket: No registration found matching code '" + cleanCode + "'."));

        // 2. Fetch associated workshop
        Workshop workshop = workshopRepository.findById(reg.getWorkshopId())
                .orElseThrow(() -> new IllegalArgumentException("Associated workshop not found for this ticket."));

        // 3. Respective Workshop Check (if scanner is set to a specific workshop)
        if (targetWorkshopId != null && !targetWorkshopId.isBlank() && !targetWorkshopId.equalsIgnoreCase("ALL")) {
            if (!workshop.getId().equals(targetWorkshopId)) {
                throw new IllegalArgumentException("Wrong Workshop! This ticket is for '" + workshop.getTitle() +
                        "' (" + workshop.getVenue() + "), NOT for this session. Please direct participant to their scheduled venue.");
            }
        }

        // 4. Organizer Ownership Check: Ticket must belong to a workshop conducted by this organizer (or super admin)
        if (organizer != null && organizer.getRole() != UserRole.SUPER_ADMIN) {
            boolean isOwner = organizer.getId().equals(workshop.getOrganizerId()) ||
                    (workshop.getOrganizerNameSnapshot() != null && organizer.getFullName().equalsIgnoreCase(workshop.getOrganizerNameSnapshot()));
            if (!isOwner) {
                throw new SecurityException("Unauthorized: Workshop '" + workshop.getTitle() +
                        "' is conducted by " + workshop.getOrganizerNameSnapshot() + ", not by your organizer account.");
            }
        }

        // 5. Check cancellation and payment validity
        if (reg.getStatus() == RegistrationStatus.CANCELLED) {
            throw new IllegalStateException("Invalid Ticket: This registration was CANCELLED by the participant.");
        }
        if (reg.getStatus() == RegistrationStatus.PENDING_PAYMENT || reg.getPaymentStatus() == PaymentStatus.FAILED) {
            throw new IllegalStateException("Entry Denied: This ticket is for an unpaid or pending payment registration.");
        }

        // 6. One-time verification rule: Check if already verified
        if (reg.isVerified() || reg.getStatus() == RegistrationStatus.ATTENDED) {
            String usedAt = reg.getVerifiedAt() != null ? reg.getVerifiedAt().toString() : "an earlier time";
            String byWhom = reg.getVerifiedBy() != null ? reg.getVerifiedBy() : "Staff";
            throw new IllegalStateException("Ticket ALREADY USED! This single-use pass was already verified at " + usedAt + " by " + byWhom + ".");
        }

        // 7. Day-of-workshop rule: ONLY valid on the workshop day
        if (workshop.getDate() != null && !workshop.getDate().isBlank()) {
            try {
                LocalDate workshopDate = LocalDate.parse(workshop.getDate().trim());
                LocalDate today = LocalDate.now();

                if (!allowDateBypass && !today.isEqual(workshopDate)) {
                    if (today.isBefore(workshopDate)) {
                        throw new IllegalStateException("Ticket NOT valid today! This pass is only valid on the workshop day (" + workshop.getDate() + "). Session starts at " + workshop.getStartTime() + ".");
                    } else {
                        throw new IllegalStateException("Ticket EXPIRED! This workshop was scheduled for " + workshop.getDate() + " and has already concluded.");
                    }
                }
            } catch (Exception e) {
                if (e instanceof IllegalStateException) throw (IllegalStateException) e;
                // If date parsing fails, log and continue
            }
        }

        // 8. Mark ticket as verified and attended
        reg.setVerified(true);
        reg.setStatus(RegistrationStatus.ATTENDED);
        reg.setVerifiedAt(LocalDateTime.now());
        reg.setVerifiedBy(organizer != null ? organizer.getFullName() : "Faculty Gate Attendant");
        reg.setUpdatedAt(LocalDateTime.now());

        Registration saved = registrationRepository.save(reg);

        auditLogRepository.save(new AuditLog(
                organizer != null ? organizer.getId() : "gate-system",
                organizer != null ? organizer.getFullName() : "Gate Staff",
                "TICKET_VERIFIED_ATTENDED",
                "REGISTRATION",
                saved.getId(),
                "One-time QR ticket " + cleanCode + " successfully verified for " + reg.getParticipantName() + " (" + workshop.getTitle() + ")"
        ));

        return saved;
    }
}
