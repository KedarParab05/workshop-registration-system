package com.workshophub.controller.api;

import com.workshophub.config.JwtUtil;
import com.workshophub.model.AuditLog;
import com.workshophub.model.User;
import com.workshophub.model.enums.RegistrationStatus;
import com.workshophub.model.enums.UserRole;
import com.workshophub.model.enums.WorkshopStatus;
import com.workshophub.repository.AuditLogRepository;
import com.workshophub.repository.RegistrationRepository;
import com.workshophub.repository.UserRepository;
import com.workshophub.repository.WorkshopRepository;
import com.workshophub.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * RESTful Web Service Controller delivering platform KPI metrics, governance, and audit trail.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminAnalyticsRestController {

    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;
    private final RegistrationRepository registrationRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AdminAnalyticsRestController(UserRepository userRepository,
                                         WorkshopRepository workshopRepository,
                                         RegistrationRepository registrationRepository,
                                         AuditLogRepository auditLogRepository,
                                         UserService userService,
                                         JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.workshopRepository = workshopRepository;
        this.registrationRepository = registrationRepository;
        this.auditLogRepository = auditLogRepository;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * GET /api/admin/analytics
     * Returns platform-wide KPI counts for super admin dashboard and monitoring.
     */
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getPlatformAnalytics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalUsers", userRepository.count());
        metrics.put("totalParticipants", userRepository.findByRole(UserRole.PARTICIPANT).size());
        metrics.put("totalOrganizers", userRepository.findByRole(UserRole.ORGANIZER).size());
        metrics.put("totalSuperAdmins", userRepository.findByRole(UserRole.SUPER_ADMIN).size());
        metrics.put("totalWorkshops", workshopRepository.count());
        metrics.put("activePublishedWorkshops", workshopRepository.countByStatus(WorkshopStatus.PUBLISHED));
        metrics.put("totalRegistrations", registrationRepository.count());
        metrics.put("activeConfirmedBookings", registrationRepository.countByStatus(RegistrationStatus.CONFIRMED));

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("timestamp", System.currentTimeMillis());
        response.put("analytics", metrics);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/audit-logs
     * Returns the latest audit logs from MongoDB.
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        List<AuditLog> logs = auditLogRepository.findTop20ByOrderByCreatedAtDesc();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", logs.size(),
                "auditLogs", logs
        ));
    }

    /**
     * PUT /api/admin/users/{id}/toggle-status
     * Suspends or activates a user account.
     */
    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable("id") String userId,
                                              @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User admin = getAdminCaller(authHeader);
            User updated = userService.toggleAccountStatus(userId, admin);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User account status changed to " + updated.getAccountStatus(),
                "accountStatus", updated.getAccountStatus().name()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/users/{id}/change-role
     * Updates a user's role.
     */
    @PutMapping("/users/{id}/change-role")
    public ResponseEntity<?> changeUserRole(@PathVariable("id") String userId,
                                            @RequestBody Map<String, String> body,
                                            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User admin = getAdminCaller(authHeader);
            String roleStr = body.get("role");
            UserRole role = UserRole.valueOf(roleStr);
            User updated = userService.changeUserRole(userId, role, admin);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User role changed to " + updated.getRole(),
                "role", updated.getRole().name()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    private User getAdminCaller(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String email = jwtUtil.extractEmail(token);
                return userService.findByEmail(email).orElse(null);
            } catch (Exception ignored) {}
        }
        return userService.findByEmail("admin@workshophub.edu").orElse(new User("Admin", "admin@workshophub.edu", "", UserRole.SUPER_ADMIN));
    }
}
