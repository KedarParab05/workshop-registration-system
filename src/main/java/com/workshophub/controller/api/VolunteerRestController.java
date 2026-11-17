package com.workshophub.controller.api;

import com.workshophub.model.AuditLog;
import com.workshophub.model.Registration;
import com.workshophub.model.User;
import com.workshophub.model.Volunteer;
import com.workshophub.model.Workshop;
import com.workshophub.model.enums.RegistrationStatus;
import com.workshophub.model.enums.UserRole;
import com.workshophub.repository.AuditLogRepository;
import com.workshophub.repository.RegistrationRepository;
import com.workshophub.repository.UserRepository;
import com.workshophub.repository.VolunteerRepository;
import com.workshophub.repository.WorkshopRepository;
import com.workshophub.util.ValidationUtils;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/volunteers")
public class VolunteerRestController {

    private final VolunteerRepository volunteerRepository;
    private final WorkshopRepository workshopRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final AuditLogRepository auditLogRepository;
    private final MongoTemplate mongoTemplate;

    public VolunteerRestController(VolunteerRepository volunteerRepository,
                                   WorkshopRepository workshopRepository,
                                   UserRepository userRepository,
                                   RegistrationRepository registrationRepository,
                                   AuditLogRepository auditLogRepository,
                                   MongoTemplate mongoTemplate) {
        this.volunteerRepository = volunteerRepository;
        this.workshopRepository = workshopRepository;
        this.userRepository = userRepository;
        this.registrationRepository = registrationRepository;
        this.auditLogRepository = auditLogRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @jakarta.annotation.PostConstruct
    public void initIndexes() {
        try {
            mongoTemplate.indexOps("volunteers").dropIndex("accessCode");
        } catch (Exception ignored) {}
        try {
            mongoTemplate.indexOps("volunteers").dropIndex("accessCode_1");
        } catch (Exception ignored) {}
    }

    private User getAuthenticatedOrganizer(Principal principal, String fallbackOrganizerId) {
        if (principal != null) {
            Optional<User> u = userRepository.findByEmailIgnoreCase(principal.getName().trim().toLowerCase());
            if (u.isPresent()) return u.get();
        }
        if (fallbackOrganizerId != null && !fallbackOrganizerId.isBlank()) {
            Optional<User> u = userRepository.findById(fallbackOrganizerId);
            if (u.isPresent()) return u.get();
        }
        return null;
    }

    private String generateSecureCode() {
        String code;
        int attempts = 0;
        do {
            int randomNum = 100000 + new Random().nextInt(900000);
            code = "VOL-" + randomNum;
            attempts++;
        } while (volunteerRepository.findByAccessCode(code).isPresent() && attempts < 50);
        return code;
    }

    /**
     * GET /api/volunteers
     * Returns list of volunteers assigned by this organizer.
     */
    @GetMapping
    public ResponseEntity<?> getVolunteers(@RequestParam(required = false) String organizerId, Principal principal) {
        User organizer = getAuthenticatedOrganizer(principal, organizerId);
        List<Volunteer> volunteers;
        if (organizer != null && organizer.getRole() == UserRole.SUPER_ADMIN) {
            volunteers = volunteerRepository.findAll();
        } else if (organizer != null) {
            List<Workshop> myWs = workshopRepository.findByOrganizerId(organizer.getId());
            Set<String> wsIds = new HashSet<>();
            for (Workshop w : myWs) {
                wsIds.add(w.getId());
            }
            List<Volunteer> byOrg = volunteerRepository.findByOrganizerId(organizer.getId());
            Set<String> seenIds = new HashSet<>();
            volunteers = new ArrayList<>();
            for (Volunteer v : byOrg) {
                if (v.getId() != null && seenIds.add(v.getId())) {
                    volunteers.add(v);
                }
            }
            for (String wid : wsIds) {
                List<Volunteer> forWs = volunteerRepository.findByAssignedWorkshopId(wid);
                for (Volunteer v : forWs) {
                    if (v.getId() != null && seenIds.add(v.getId())) {
                        volunteers.add(v);
                    }
                }
            }
        } else {
            volunteers = volunteerRepository.findAll();
        }
        return ResponseEntity.ok(Map.of("success", true, "volunteers", volunteers));
    }

    /**
     * POST /api/volunteers/request
     * A logged-in volunteer user requests an organizer to volunteer for a specific workshop.
     * The organizer will review the request and approve it by issuing a volunteer access code.
     */
    @PostMapping("/request")
    public ResponseEntity<?> requestVolunteering(@RequestBody Map<String, String> body) {
        try {
            String name = body.get("name");
            String email = body.get("email");
            String phoneNumber = body.get("phoneNumber");
            String workshopId = body.get("assignedWorkshopId");
            String requestNote = body.get("requestNote");

            String validEmail = ValidationUtils.validateEmail(email);
            String validName = (name != null && !name.isBlank()) ? ValidationUtils.validateFullName(name) : "Volunteer Applicant";
            String cleanPhone = (phoneNumber != null && !phoneNumber.isBlank()) ? ValidationUtils.validateAndCleanIndianPhone(phoneNumber) : null;

            if (workshopId == null || workshopId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Workshop selection is required."));
            }

            Workshop workshop = workshopRepository.findById(workshopId).orElse(null);
            if (workshop == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Workshop not found."));
            }

            String cleanEmail = validEmail;
            Optional<Volunteer> existingOpt = volunteerRepository.findByEmailIgnoreCaseAndAssignedWorkshopId(cleanEmail, workshopId);
            if (existingOpt.isPresent()) {
                Volunteer existing = existingOpt.get();
                if ("ACTIVE".equalsIgnoreCase(existing.getStatus()) && existing.getAccessCode() != null) {
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "alreadyApproved", true,
                            "message", "Your volunteering request was already approved! Your Access Code is: " + existing.getAccessCode(),
                            "volunteer", existing,
                            "accessCode", existing.getAccessCode()
                    ));
                } else if ("PENDING_APPROVAL".equalsIgnoreCase(existing.getStatus())) {
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "pending", true,
                            "message", "Your request is currently pending organizer approval. Please check back shortly or ask the organizer for your code.",
                            "volunteer", existing
                    ));
                }
            }

            Volunteer v = existingOpt.orElseGet(Volunteer::new);
            v.setName(validName);
            v.setEmail(cleanEmail);
            v.setPhoneNumber(cleanPhone);
            v.setOrganizerId(workshop.getOrganizerId());
            v.setOrganizerName(workshop.getOrganizerNameSnapshot());
            v.setAssignedWorkshopId(workshop.getId());
            v.setAssignedWorkshopTitle(workshop.getTitle());
            v.setStatus("PENDING_APPROVAL");
            v.setRequestNote(requestNote != null ? requestNote.trim() : "Requested via Volunteer Portal");
            v.setCreatedAt(LocalDateTime.now());
            v.setAccessCode(null);

            Volunteer saved = volunteerRepository.save(v);

            auditLogRepository.save(new AuditLog(
                    saved.getId(),
                    saved.getName(),
                    "VOLUNTEER_REQUEST_SUBMITTED",
                    "VOLUNTEER",
                    saved.getId(),
                    "Volunteer " + saved.getName() + " requested to volunteer for '" + workshop.getTitle() + "'"
            ));

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "pending", true,
                    "message", "Request submitted to workshop organizer (" + workshop.getOrganizerNameSnapshot() + ")! Once they approve it, they will give you an Access Code.",
                    "volunteer", saved
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * GET /api/volunteers/my-status
     * Allows a volunteer to check the status of their requests by email.
     */
    @GetMapping("/my-status")
    public ResponseEntity<?> getMyVolunteerStatus(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Email parameter is required."));
        }
        List<Volunteer> list = volunteerRepository.findByEmailIgnoreCase(email.trim().toLowerCase());
        return ResponseEntity.ok(Map.of("success", true, "requests", list));
    }

    /**
     * PUT /api/volunteers/{id}/approve
     * Organizer approves a pending volunteering request and generates their Access Code.
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveVolunteerRequest(@PathVariable String id, Principal principal) {
        Optional<Volunteer> opt = volunteerRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Volunteer request not found."));
        }
        Volunteer v = opt.get();
        if (v.getAccessCode() == null || v.getAccessCode().isBlank()) {
            v.setAccessCode(generateSecureCode());
        }
        v.setStatus("ACTIVE");
        User organizer = getAuthenticatedOrganizer(principal, null);
        if (organizer != null) {
            v.setOrganizerId(organizer.getId());
            v.setOrganizerName(organizer.getFullName());
        }
        Volunteer saved = volunteerRepository.save(v);

        auditLogRepository.save(new AuditLog(
                v.getOrganizerId(),
                v.getOrganizerName(),
                "VOLUNTEER_REQUEST_APPROVED",
                "VOLUNTEER",
                saved.getId(),
                "Approved volunteering request for " + saved.getName() + ". Access Code: " + saved.getAccessCode()
        ));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Volunteer request approved! Gate Access Code generated: " + saved.getAccessCode(),
                "volunteer", saved,
                "accessCode", saved.getAccessCode()
        ));
    }

    /**
     * PUT /api/volunteers/{id}/reject
     * Organizer rejects a pending volunteering request.
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectVolunteerRequest(@PathVariable String id) {
        Optional<Volunteer> opt = volunteerRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Volunteer request not found."));
        }
        Volunteer v = opt.get();
        v.setStatus("REJECTED");
        Volunteer saved = volunteerRepository.save(v);
        return ResponseEntity.ok(Map.of("success", true, "message", "Volunteer request rejected.", "volunteer", saved));
    }

    /**
     * POST /api/volunteers
     * Organizer creates and assigns a gate volunteer for a workshop.
     */
    @PostMapping
    public ResponseEntity<?> createVolunteer(@RequestBody Map<String, String> body, Principal principal) {
        try {
            String name = body.get("name");
            String email = body.get("email");
            String phoneNumber = body.get("phoneNumber");
            String workshopId = body.get("assignedWorkshopId");
            String organizerId = body.get("organizerId");

            String validName = ValidationUtils.validateFullName(name);
            String validEmail = ValidationUtils.validateEmail(email);
            String cleanPhone = (phoneNumber != null && !phoneNumber.isBlank()) ? ValidationUtils.validateAndCleanIndianPhone(phoneNumber) : null;

            if (workshopId == null || workshopId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Assigned workshop is required."));
            }

            Workshop workshop = workshopRepository.findById(workshopId).orElse(null);
            if (workshop == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Workshop not found."));
            }

            User organizer = getAuthenticatedOrganizer(principal, organizerId != null ? organizerId : workshop.getOrganizerId());
            String orgId = organizer != null ? organizer.getId() : workshop.getOrganizerId();
            String orgName = organizer != null ? organizer.getFullName() : workshop.getOrganizerNameSnapshot();

            String code = generateSecureCode();
            Volunteer volunteer = new Volunteer(validName, validEmail, orgId, orgName, workshop.getId(), workshop.getTitle(), code);
            if (cleanPhone != null) {
                volunteer.setPhoneNumber(cleanPhone);
            }
            Volunteer saved = volunteerRepository.save(volunteer);

            auditLogRepository.save(new AuditLog(
                    orgId,
                    orgName,
                    "VOLUNTEER_ASSIGNED",
                    "VOLUNTEER",
                    saved.getId(),
                    "Gate volunteer " + saved.getName() + " assigned to workshop '" + workshop.getTitle() + "' with code " + code
            ));

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "volunteer", saved,
                    "accessCode", code,
                    "message", "Volunteer assigned successfully. Share code '" + code + "' with volunteer."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * PUT /api/volunteers/{id}
     * Updates volunteer profile (name, email, phoneNumber).
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVolunteerProfile(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            Optional<Volunteer> opt = volunteerRepository.findById(id);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Volunteer not found."));
            }
            Volunteer v = opt.get();
            if (body.containsKey("name")) {
                v.setName(ValidationUtils.validateFullName(body.get("name")));
            }
            if (body.containsKey("email")) {
                v.setEmail(ValidationUtils.validateEmail(body.get("email")));
            }
            if (body.containsKey("phoneNumber")) {
                String raw = body.get("phoneNumber");
                if (raw != null && !raw.isBlank()) {
                    v.setPhoneNumber(ValidationUtils.validateAndCleanIndianPhone(raw));
                } else {
                    v.setPhoneNumber(null);
                }
            }
            Volunteer saved = volunteerRepository.save(v);
            return ResponseEntity.ok(Map.of("success", true, "volunteer", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * PUT /api/volunteers/{id}/toggle-status
     */
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleVolunteerStatus(@PathVariable String id) {
        Optional<Volunteer> opt = volunteerRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Volunteer not found."));
        }
        Volunteer v = opt.get();
        v.setStatus("ACTIVE".equalsIgnoreCase(v.getStatus()) ? "REVOKED" : "ACTIVE");
        volunteerRepository.save(v);
        return ResponseEntity.ok(Map.of("success", true, "volunteer", v));
    }

    /**
     * PUT /api/volunteers/{id}/regenerate-code
     */
    @PutMapping("/{id}/regenerate-code")
    public ResponseEntity<?> regenerateCode(@PathVariable String id) {
        Optional<Volunteer> opt = volunteerRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Volunteer not found."));
        }
        Volunteer v = opt.get();
        String newCode = generateSecureCode();
        v.setAccessCode(newCode);
        v.setStatus("ACTIVE");
        Volunteer saved = volunteerRepository.save(v);
        return ResponseEntity.ok(Map.of("success", true, "volunteer", saved, "newCode", newCode));
    }

    /**
     * DELETE /api/volunteers/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVolunteer(@PathVariable String id) {
        if (!volunteerRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Volunteer not found."));
        }
        volunteerRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Volunteer removed successfully."));
    }

    /**
     * POST /api/volunteers/verify-access
     * Volunteer enters their Organization + Access Code to log in to the Gate Scanner.
     */
    @PostMapping("/verify-access")
    public ResponseEntity<?> verifyVolunteerAccess(@RequestBody Map<String, String> body) {
        String code = body.get("accessCode");
        String organizerId = body.get("organizerId");

        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Volunteer access code is required."));
        }

        final String cleanCode = code.trim().toUpperCase();

        Optional<Volunteer> volunteerOpt;
        if (organizerId != null && !organizerId.isBlank() && !organizerId.equalsIgnoreCase("ALL")) {
            volunteerOpt = volunteerRepository.findByOrganizerIdAndAccessCode(organizerId.trim(), cleanCode);
        } else {
            volunteerOpt = volunteerRepository.findByAccessCode(cleanCode);
        }

        if (volunteerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "error", "Invalid Access Code. Please check the code provided by your Organization/Faculty."
            ));
        }

        Volunteer volunteer = volunteerOpt.get();
        if (!"ACTIVE".equalsIgnoreCase(volunteer.getStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "error", "This volunteer pass has been revoked or suspended by the organization."
            ));
        }

        Workshop workshop = workshopRepository.findById(volunteer.getAssignedWorkshopId()).orElse(null);

        String name = body.get("name");
        String email = body.get("email");
        String phoneNumber = body.get("phoneNumber");

        if (name != null && !name.isBlank()) volunteer.setName(name.trim());
        if (email != null && !email.isBlank()) volunteer.setEmail(email.trim().toLowerCase());
        if (phoneNumber != null && !phoneNumber.isBlank()) volunteer.setPhoneNumber(phoneNumber.trim());

        volunteer.setLastActiveAt(LocalDateTime.now());
        volunteerRepository.save(volunteer);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Volunteer access verified successfully! Gate scanner unlocked.",
                "volunteer", volunteer,
                "workshop", workshop != null ? workshop : Map.of("title", volunteer.getAssignedWorkshopTitle())
        ));
    }

    /**
     * POST /api/volunteers/verify-ticket
     * Scans and verifies a participant's ticket at the gate on behalf of the volunteer's assigned workshop.
     */
    @PostMapping("/verify-ticket")
    public ResponseEntity<?> verifyTicketByVolunteer(@RequestBody Map<String, Object> body) {
        String accessCode = (String) body.get("accessCode");
        String ticketCode = (String) body.get("ticketCode");
        boolean allowDateBypass = Boolean.TRUE.equals(body.get("allowDateBypass"));

        if (accessCode == null || accessCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Volunteer authorization code is required."));
        }
        if (ticketCode == null || ticketCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Ticket code is required for scanning."));
        }

        Volunteer volunteer = volunteerRepository.findByAccessCode(accessCode.trim().toUpperCase()).orElse(null);
        if (volunteer == null || !"ACTIVE".equalsIgnoreCase(volunteer.getStatus())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "error", "Invalid or revoked volunteer authorization."));
        }

        final String cleanTicket = ticketCode.trim();

        Registration reg = registrationRepository.findByTicketCode(cleanTicket)
                .or(() -> registrationRepository.findById(cleanTicket))
                .orElse(null);

        if (reg == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "Invalid Ticket: No participant registration found matching '" + cleanTicket + "'."
            ));
        }

        Workshop workshop = workshopRepository.findById(reg.getWorkshopId()).orElse(null);
        if (workshop == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Associated workshop not found."));
        }

        // Strict Respective Workshop Check: Must match volunteer's assigned workshop!
        if (!workshop.getId().equals(volunteer.getAssignedWorkshopId())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "WRONG WORKSHOP! This pass is for '" + workshop.getTitle() + "' at " + workshop.getVenue() +
                            ", NOT for your assigned session ('" + volunteer.getAssignedWorkshopTitle() + "'). Please redirect participant to their proper venue."
            ));
        }

        // Check cancellation
        if (reg.getStatus() == RegistrationStatus.CANCELLED) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Ticket VOID: Registration was cancelled by the participant."
            ));
        }

        // Single-use check: Cannot be verified twice!
        if (reg.isVerified() || reg.getStatus() == RegistrationStatus.ATTENDED) {
            String usedAt = reg.getVerifiedAt() != null ? reg.getVerifiedAt().toString() : "earlier";
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "TICKET ALREADY USED! Verified at " + usedAt + " by " + (reg.getVerifiedBy() != null ? reg.getVerifiedBy() : "Gate Staff") + "."
            ));
        }

        // Date validity check: Valid on workshop date
        if (workshop.getDate() != null && !workshop.getDate().isBlank()) {
            try {
                LocalDate wsDate = LocalDate.parse(workshop.getDate().trim());
                LocalDate today = LocalDate.now();
                if (!allowDateBypass && !today.isEqual(wsDate)) {
                    if (today.isBefore(wsDate)) {
                        return ResponseEntity.badRequest().body(Map.of(
                                "success", false,
                                "error", "TICKET NOT YET VALID: Scheduled for " + workshop.getDate() + ". Gates open on the workshop day."
                        ));
                    } else {
                        return ResponseEntity.badRequest().body(Map.of(
                                "success", false,
                                "error", "EXPIRED PASS: Workshop took place on " + workshop.getDate() + "."
                        ));
                    }
                }
            } catch (Exception ignored) {}
        }

        // Mark attended
        reg.setVerified(true);
        reg.setStatus(RegistrationStatus.ATTENDED);
        reg.setVerifiedAt(LocalDateTime.now());
        reg.setVerifiedBy("Volunteer: " + volunteer.getName());
        reg.setUpdatedAt(LocalDateTime.now());
        Registration savedReg = registrationRepository.save(reg);

        volunteer.incrementScanned();
        volunteerRepository.save(volunteer);

        auditLogRepository.save(new AuditLog(
                volunteer.getId(),
                "Volunteer: " + volunteer.getName(),
                "VOLUNTEER_TICKET_VERIFIED",
                "REGISTRATION",
                savedReg.getId(),
                "Volunteer " + volunteer.getName() + " verified gate pass for " + savedReg.getParticipantName() + " (" + workshop.getTitle() + ")"
        ));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Ticket verified successfully! One-time entry granted for " + savedReg.getParticipantName() + ".",
                "registration", savedReg,
                "workshop", workshop
        ));
    }
}
