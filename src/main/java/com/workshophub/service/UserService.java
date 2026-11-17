package com.workshophub.service;

import com.workshophub.model.AuditLog;
import com.workshophub.model.User;
import com.workshophub.model.enums.AccountStatus;
import com.workshophub.model.enums.UserRole;
import com.workshophub.repository.AuditLogRepository;
import com.workshophub.repository.UserRepository;
import com.workshophub.util.ValidationUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service managing user authentication, role management, and security safeguards.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogRepository = auditLogRepository;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email);
    }

    /**
     * Registers a new user from public forms.
     * Rule: Never allow public registration to assign SUPER_ADMIN role.
     */
    public User registerUser(String fullName, String email, String rawPassword, UserRole requestedRole, String department) {
        return registerUser(fullName, email, rawPassword, requestedRole, department, null);
    }

    /**
     * Registers a new user with full security validations:
     * - Name validated (>= 2 chars)
     * - Email validated (standard pattern)
     * - Password complexity enforced (>= 6 chars, uppercase, lowercase, digit)
     * - Phone number validated (10 digits Indian format ^[6-9]\d{9}$)
     * - BCrypt password encryption
     */
    public User registerUser(String fullName, String email, String rawPassword, UserRole requestedRole, String department, String phoneNumber) {
        String validName = ValidationUtils.validateFullName(fullName);
        String validEmail = ValidationUtils.validateEmail(email);

        if (userRepository.existsByEmailIgnoreCase(validEmail)) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }

        ValidationUtils.validatePassword(rawPassword);

        String cleanPhone = null;
        if (phoneNumber != null && !phoneNumber.isBlank()) {
            cleanPhone = ValidationUtils.validateAndCleanIndianPhone(phoneNumber);
        }

        // Security rule: Prevent public registration from assigning SUPER_ADMIN
        UserRole safeRole = (requestedRole == UserRole.ORGANIZER) ? UserRole.ORGANIZER 
                          : (requestedRole == UserRole.VOLUNTEER) ? UserRole.VOLUNTEER 
                          : UserRole.PARTICIPANT;

        User user = new User();
        user.setFullName(validName);
        user.setEmail(validEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(safeRole);
        user.setDepartment(department != null ? department.trim() : null);
        user.setPhoneNumber(cleanPhone);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);

        auditLogRepository.save(new AuditLog(
            saved.getId(),
            saved.getFullName(),
            "USER_REGISTERED",
            "USER",
            saved.getId(),
            "New account created with role: " + saved.getRole()
        ));

        return saved;
    }

    /**
     * Super Admin toggle: Activate or suspend user account.
     * Prevents self-lockout.
     */
    public User toggleAccountStatus(String targetUserId, User adminUser) {
        if (adminUser.getRole() != UserRole.SUPER_ADMIN) {
            throw new SecurityException("Only super administrators can alter account status.");
        }
        if (targetUserId.equals(adminUser.getId())) {
            throw new IllegalStateException("Security safeguard: Super administrators cannot suspend their own account.");
        }

        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + targetUserId));

        AccountStatus nextStatus = (target.getAccountStatus() == AccountStatus.ACTIVE)
            ? AccountStatus.SUSPENDED
            : AccountStatus.ACTIVE;

        target.setAccountStatus(nextStatus);
        target.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(target);

        auditLogRepository.save(new AuditLog(
            adminUser.getId(),
            adminUser.getFullName(),
            "USER_STATUS_CHANGED",
            "USER",
            saved.getId(),
            "Changed account status of " + saved.getEmail() + " to " + nextStatus
        ));

        return saved;
    }

    /**
     * Super Admin only: Promote or change user role.
     */
    public User changeUserRole(String targetUserId, UserRole newRole, User adminUser) {
        if (adminUser.getRole() != UserRole.SUPER_ADMIN) {
            throw new SecurityException("Only super administrators can modify roles.");
        }
        if (targetUserId.equals(adminUser.getId()) && newRole != UserRole.SUPER_ADMIN) {
            throw new IllegalStateException("Security safeguard: Super administrators cannot demote themselves.");
        }

        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + targetUserId));

        target.setRole(newRole);
        target.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(target);

        auditLogRepository.save(new AuditLog(
            adminUser.getId(),
            adminUser.getFullName(),
            "USER_ROLE_CHANGED",
            "USER",
            saved.getId(),
            "Promoted/changed role of " + saved.getEmail() + " to " + newRole
        ));

        return saved;
    }
}
