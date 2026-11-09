package com.workshophub.controller.api;

import com.workshophub.config.JwtUtil;
import com.workshophub.model.User;
import com.workshophub.model.enums.AccountStatus;
import com.workshophub.model.enums.UserRole;
import com.workshophub.repository.UserRepository;
import com.workshophub.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST API for authentication: email/password login, registration, profile, and demo personas.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthRestController(UserService userService,
                              UserRepository userRepository,
                              JwtUtil jwtUtil,
                              PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * POST /api/auth/check-email
     * Checks whether an email is already registered in MongoDB.
     * Returns { exists: true/false }. Used by the frontend smart auth flow.
     */
    @PostMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Email is required."));
        }
        boolean exists = userService.findByEmail(email.trim().toLowerCase()).isPresent();
        return ResponseEntity.ok(Map.of("success", true, "exists", exists, "email", email.trim().toLowerCase()));
    }

    /**
     * POST /api/auth/login
     * Authenticates user with email + password, returns JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Email and password are required."));
        }

        Optional<User> userOpt = userService.findByEmail(email.trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "No account found with this email address."));
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Incorrect password. Please try again."));
        }

        if (user.getAccountStatus().name().equals("SUSPENDED")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Your account has been suspended."));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return ResponseEntity.ok(buildAuthResponse(token, user));
    }

    /**
     * POST /api/auth/register
     * Creates new user account in MongoDB and returns JWT token.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            String fullName = body.get("fullName");
            String email = body.get("email");
            String password = body.get("password");
            String roleStr = body.get("role");
            String department = body.get("department");
            String phoneNumber = body.get("phoneNumber");

            UserRole role = "ORGANIZER".equalsIgnoreCase(roleStr) ? UserRole.ORGANIZER 
                          : "VOLUNTEER".equalsIgnoreCase(roleStr) ? UserRole.VOLUNTEER 
                          : UserRole.PARTICIPANT;
            User user = userService.registerUser(fullName, email, password, role, department);
            if (phoneNumber != null && !phoneNumber.isBlank()) {
                user.setPhoneNumber(phoneNumber.trim());
                userRepository.save(user);
            }
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(buildAuthResponse(token, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * GET /api/auth/me
     * Returns the currently authenticated user profile from MongoDB.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "error", "Not authenticated."));
        }
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(Map.of("success", true, "user", safeUser(user)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "error", "Token invalid or expired."));
        }
    }

    /**
     * PUT /api/auth/profile
     * Updates user's fullName or department in MongoDB.
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body,
                                           @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "error", "Not authenticated."));
        }
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            if (body.containsKey("fullName") && body.get("fullName") != null && !body.get("fullName").isBlank()) {
                user.setFullName(body.get("fullName").trim());
            }
            if (body.containsKey("department")) {
                user.setDepartment(body.get("department"));
            }
            if (body.containsKey("phoneNumber")) {
                user.setPhoneNumber(body.get("phoneNumber"));
            }
            user.setUpdatedAt(java.time.LocalDateTime.now());
            User saved = userRepository.save(user);
            return ResponseEntity.ok(Map.of("success", true, "user", safeUser(saved)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * POST /api/auth/switch-demo
     * Instantly switches to a demo persona with a real signed JWT token.
     */
    @PostMapping("/switch-demo")
    public ResponseEntity<?> switchDemoUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Email is required."));
        }
        User user = userService.findByEmail(email.trim().toLowerCase()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Demo user not found: " + email));
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return ResponseEntity.ok(buildAuthResponse(token, user));
    }

    /**
     * POST /api/auth/refresh-token
     * Validates current valid/non-expired or near-expiry token and issues fresh JWT token.
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "error", "Missing token"));
        }
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            User user = userService.findByEmail(email).orElse(null);
            if (user == null || user.getAccountStatus().name().equals("SUSPENDED")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "error", "User inactive or not found"));
            }
            String newToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
            return ResponseEntity.ok(buildAuthResponse(newToken, user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "error", "Invalid token"));
        }
    }

    /**
     * GET /api/auth/users
     * Returns list of platform users from MongoDB.
     * Only returns full list if caller is authenticated organizer or super admin.
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        // Allow organizers/admin or return organizers for appointment dropdown
        boolean isElevated = false;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String email = jwtUtil.extractEmail(token);
                Optional<User> caller = userService.findByEmail(email);
                if (caller.isPresent() && (caller.get().getRole() == UserRole.ORGANIZER || caller.get().getRole() == UserRole.SUPER_ADMIN)) {
                    isElevated = true;
                }
            } catch (Exception ignored) {}
        }

        List<User> all = userService.findAll();
        // If not elevated, only return public organizers (needed for volunteer selector modal)
        List<User> filtered = isElevated 
            ? all 
            : all.stream().filter(u -> u.getRole() == UserRole.ORGANIZER || u.getRole() == UserRole.SUPER_ADMIN).toList();

        List<Map<String, Object>> safeList = filtered.stream().map(this::safeUser).toList();
        return ResponseEntity.ok(Map.of("success", true, "count", safeList.size(), "users", safeList));
    }

    private Map<String, Object> buildAuthResponse(String token, User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", token);
        response.put("user", safeUser(user));
        return response;
    }

    private Map<String, Object> safeUser(User user) {
        Map<String, Object> u = new HashMap<>();
        u.put("id", user.getId());
        u.put("fullName", user.getFullName());
        u.put("email", user.getEmail());
        u.put("role", user.getRole().name());
        u.put("accountStatus", user.getAccountStatus().name());
        u.put("department", user.getDepartment());
        u.put("phoneNumber", user.getPhoneNumber());
        u.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return u;
    }
}
