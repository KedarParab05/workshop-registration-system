
package com.workshophub.controller.api;

import com.workshophub.config.JwtUtil;
import com.workshophub.model.Registration;
import com.workshophub.model.User;
import com.workshophub.model.Workshop;
import com.workshophub.model.enums.UserRole;
import com.workshophub.model.enums.WorkshopStatus;
import com.workshophub.service.RegistrationService;
import com.workshophub.service.UserService;
import com.workshophub.service.WorkshopService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * RESTful Web Service Controller exposing workshop data and registration
 * endpoints in JSON format.
 * Fully connected to MongoDB persistence.
 */
@RestController
@RequestMapping("/api/workshops")
public class WorkshopRestController {

    private final WorkshopService workshopService;
    private final RegistrationService registrationService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public WorkshopRestController(WorkshopService workshopService,
            RegistrationService registrationService,
            UserService userService,
            JwtUtil jwtUtil) {
        this.workshopService = workshopService;
        this.registrationService = registrationService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    private User getAuthenticatedUser(Principal principal, String fallbackId, String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String email = jwtUtil.extractEmail(token);
                User user = userService.findByEmail(email).orElse(null);
                if (user != null) return user;
            } catch (Exception ignored) {}
        }
        if (principal != null && principal.getName() != null) {
            User user = userService.findByEmail(principal.getName()).orElse(null);
            if (user != null) return user;
        }
        if (fallbackId != null && !fallbackId.isBlank()) {
            User user = userService.findById(fallbackId).orElse(null);
            if (user != null) return user;
        }
        return null;
    }

    /**
     * GET /api/workshops
     * Returns list of workshops (published by default, or all if ?all=true or
     * organizer query).
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getWorkshops(
            @RequestParam(value = "all", required = false, defaultValue = "false") boolean all,
            @RequestParam(value = "organizerId", required = false) String organizerId) {
        List<Workshop> workshops;
        if (organizerId != null && !organizerId.isBlank()) {
            workshops = workshopService.findByOrganizerId(organizerId);
        } else if (all) {
            workshops = workshopService.findAll();
        } else {
            workshops = workshopService.findAll(); // Return all so frontend can filter tabs (Published, Draft, etc.)
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.OK.value());
        response.put("success", true);
        response.put("count", workshops.size());
        response.put("data", workshops);
        response.put("workshops", workshops);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/workshops/{id}
     * Returns detailed workshop document and real-time seat availability.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getWorkshopById(@PathVariable("id") String id) {
        return workshopService.findById(id)
                .map(ws -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("workshop", ws);
                    data.put("registeredAttendees", workshopService.getActiveAttendeeCount(id));
                    data.put("availableSeats", workshopService.getAvailableSeats(ws));
                    data.put("isFull", workshopService.isWorkshopFull(ws));
                    return ResponseEntity.ok(data);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "error", "Workshop not found: " + id)));
    }

    /**
     * POST /api/workshops
     * Creates a new workshop in MongoDB (Organizer/Admin only).
     */
    @PostMapping
    public ResponseEntity<?> createWorkshop(@RequestBody Workshop workshop,
                                            @RequestHeader(value = "Authorization", required = false) String authHeader,
                                            Principal principal) {
        User user = getAuthenticatedUser(principal, workshop.getOrganizerId(), authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Authentication required to create a workshop."));
        }

        try {
            Workshop created = workshopService.createWorkshop(workshop, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "message", "Workshop created successfully.",
                    "workshop", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage() != null ? e.getMessage() : "Failed to create workshop."));
        }
    }

    /**
     * PUT /api/workshops/{id}
     * Updates an existing workshop in MongoDB.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateWorkshop(@PathVariable("id") String id,
                                            @RequestBody Workshop updatedData,
                                            @RequestHeader(value = "Authorization", required = false) String authHeader,
                                            Principal principal) {
        User user = getAuthenticatedUser(principal, updatedData.getOrganizerId(), authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Authentication required to update workshop."));
        }

        try {
            Workshop updated = workshopService.updateWorkshop(id, updatedData, user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Workshop updated successfully.",
                    "workshop", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage() != null ? e.getMessage() : "Failed to update workshop."));
        }
    }

    /**
     * DELETE /api/workshops/{id}
     * Safely deletes or cancels workshop in MongoDB.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkshop(@PathVariable("id") String id,
                                            @RequestHeader(value = "Authorization", required = false) String authHeader,
                                            Principal principal) {
        User user = getAuthenticatedUser(principal, null, authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Authentication required."));
        }

        try {
            workshopService.deleteOrCancelWorkshop(id, user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Workshop deleted or cancelled successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * PATCH /api/workshops/{id}/toggle-status
     * Toggles between PUBLISHED and DRAFT.
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> togglePublishStatus(@PathVariable("id") String id, Principal principal) {
        User user = getAuthenticatedUser(principal, null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Authentication required."));
        }

        return workshopService.findById(id).map(ws -> {
            if (user.getRole() != UserRole.SUPER_ADMIN && !user.getId().equals(ws.getOrganizerId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "error", "Permission denied."));
            }
            WorkshopStatus next = ws.getStatus() == WorkshopStatus.PUBLISHED ? WorkshopStatus.DRAFT
                    : WorkshopStatus.PUBLISHED;
            ws.setStatus(next);
            Workshop saved = workshopService.updateWorkshop(id, ws, user);
            return ResponseEntity.ok(Map.of("success", true, "workshop", saved));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "error", "Workshop not found.")));
    }

    /**
     * GET /api/workshops/{id}/registrations
     * Returns attendee list for a specific workshop (for organizers).
     */
    @GetMapping("/{id}/registrations")
    public ResponseEntity<?> getWorkshopRegistrations(@PathVariable("id") String workshopId, Principal principal) {
        List<Registration> attendees = registrationService.findByWorkshop(workshopId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", attendees.size(),
                "registrations", attendees));
    }

    /**
     * POST /api/workshops/{id}/registrations
     * Books a seat for the authenticated participant in MongoDB.
     */
    @PostMapping("/{id}/registrations")
    public ResponseEntity<?> registerParticipant(@PathVariable("id") String workshopId,
            @RequestBody(required = false) Map<String, String> body,
            Principal principal) {
        String fallbackParticipantId = body != null ? body.get("participantId") : null;
        User participant = getAuthenticatedUser(principal, fallbackParticipantId);
        if (participant == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Please sign in to register for workshops."));
        }

        try {
            String notes = body != null ? body.get("notes") : "";
            Registration reg = registrationService.registerParticipant(workshopId, participant, notes);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Free workshop registration confirmed.");
            response.put("registration", reg);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
