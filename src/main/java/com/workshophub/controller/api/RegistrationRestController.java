package com.workshophub.controller.api;

import com.workshophub.model.Registration;
import com.workshophub.model.User;
import com.workshophub.config.JwtUtil;
import com.workshophub.service.RegistrationService;
import com.workshophub.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * RESTful Web Service Controller for participant ticket management and cancellation.
 */
@RestController
@RequestMapping("/api/registrations")
public class RegistrationRestController {

    private final RegistrationService registrationService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public RegistrationRestController(RegistrationService registrationService, UserService userService, JwtUtil jwtUtil) {
        this.registrationService = registrationService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    private User getAuthenticatedUser(Principal principal) {
        if (principal != null && principal.getName() != null) {
            User user = userService.findByEmail(principal.getName()).orElse(null);
            if (user != null) return user;
        }
        return null;
    }

    /**
     * GET /api/registrations/me
     * Returns list of registrations belonging to the authenticated participant.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyRegistrations(Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Authentication required."));
        }

        List<Registration> list = registrationService.findByParticipant(user.getId());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("participantId", user.getId());
        response.put("count", list.size());
        response.put("registrations", list);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/registrations
     * Returns all platform registrations (for organizers and admin).
     */
    @GetMapping
    public ResponseEntity<?> getAllRegistrations(Principal principal) {
        List<Registration> list = registrationService.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", list.size());
        response.put("registrations", list);

        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/registrations/{id}
     * Cancels an active registration and restores seat capacity in MongoDB.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelRegistration(@PathVariable("id") String id,
                                                @RequestHeader(value = "Authorization", required = false) String authHeader,
                                                Principal principal) {
        User user = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String email = jwtUtil.extractEmail(token);
                user = userService.findByEmail(email).orElse(null);
            } catch (Exception ignored) {}
        }
        if (user == null) {
            user = getAuthenticatedUser(principal);
        }
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Authentication required."));
        }

        try {
            Registration cancelled = registrationService.cancelRegistration(id, user);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Registration cancelled and seat restored.",
                "registration", cancelled
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * POST /api/registrations/verify-ticket
     * Scans and verifies a participant's one-time QR ticket code.
     * Enforces single-use verification on the day of the workshop.
     */
    @PostMapping("/verify-ticket")
    public ResponseEntity<?> verifyTicket(@RequestBody Map<String, Object> body, Principal principal) {
        User user = getAuthenticatedUser(principal);
        String ticketCode = body != null && body.get("ticketCode") != null ? body.get("ticketCode").toString() : null;
        String targetWorkshopId = body != null && body.get("targetWorkshopId") != null ? body.get("targetWorkshopId").toString() : null;
        boolean allowBypass = body != null && Boolean.parseBoolean(String.valueOf(body.get("allowDateBypass")));

        try {
            Registration verified = registrationService.verifyTicket(ticketCode, targetWorkshopId, user, allowBypass);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Ticket successfully verified! One-time entry granted.",
                "registration", verified
            ));
        } catch (IllegalArgumentException | IllegalStateException | SecurityException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Ticket verification failed: " + e.getMessage()
            ));
        }
    }
}
