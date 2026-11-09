package com.workshophub.config;

import com.workshophub.model.AuditLog;
import com.workshophub.model.Registration;
import com.workshophub.model.User;
import com.workshophub.model.Volunteer;
import com.workshophub.model.Workshop;
import com.workshophub.model.enums.UserRole;
import com.workshophub.repository.AuditLogRepository;
import com.workshophub.repository.RegistrationRepository;
import com.workshophub.repository.UserRepository;
import com.workshophub.repository.VolunteerRepository;
import com.workshophub.repository.WorkshopRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Initializes database cleanly: purges legacy sample personas and ensures bootstrap admin.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;
    private final RegistrationRepository registrationRepository;
    private final VolunteerRepository volunteerRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${workshophub.admin.email:admin@workshophub.edu}")
    private String adminEmail;

    @Value("${workshophub.admin.password:AdminPass123!}")
    private String adminPassword;

    public DataInitializer(UserRepository userRepository,
                           WorkshopRepository workshopRepository,
                           RegistrationRepository registrationRepository,
                           VolunteerRepository volunteerRepository,
                           AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.workshopRepository = workshopRepository;
        this.registrationRepository = registrationRepository;
        this.volunteerRepository = volunteerRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            bootstrapSuperAdmin();
        } catch (Exception e) {
            System.out.println("[DataInitializer] Message: " + e.getMessage());
        }
    }

    /**
     * Purges all fake sample personas, mock registrations, mock volunteers and mock workshops.
     */
    private void purgeLegacySampleData() {
        List<String> sampleEmails = List.of(
            "sarah@faculty.edu",
            "alex@student.edu",
            "vikram@faculty.edu",
            "maya@student.edu",
            "jordan@student.edu",
            "johndoe@example.com",
            "marcus.gate@volunteer.edu",
            "elena.volunteer@university.edu"
        );

        // 1. Remove sample registrations
        for (Registration reg : registrationRepository.findAll()) {
            String email = reg.getParticipantEmail() != null ? reg.getParticipantEmail().toLowerCase().trim() : "";
            String name = reg.getParticipantName() != null ? reg.getParticipantName().toLowerCase().trim() : "";
            if (sampleEmails.contains(email) || name.contains("sarah") || name.contains("alex") || name.contains("maya") || name.contains("jordan")) {
                registrationRepository.delete(reg);
            }
        }

        // 2. Remove sample volunteers
        for (Volunteer v : volunteerRepository.findAll()) {
            String email = v.getEmail() != null ? v.getEmail().toLowerCase().trim() : "";
            String name = v.getName() != null ? v.getName().toLowerCase().trim() : "";
            String code = v.getAccessCode() != null ? v.getAccessCode().trim() : "";
            if (sampleEmails.contains(email) || email.contains("volunteer.edu") || name.contains("marcus") || name.contains("elena") || "VOL-729104".equals(code) || "VOL-495946".equals(code)) {
                volunteerRepository.delete(v);
            }
        }

        // 3. Remove sample workshops hosted by Sarah Lin or Vikram Rao
        for (Workshop ws : workshopRepository.findAll()) {
            String orgName = ws.getOrganizerNameSnapshot() != null ? ws.getOrganizerNameSnapshot().toLowerCase().trim() : "";
            if (orgName.contains("sarah") || orgName.contains("vikram")) {
                workshopRepository.delete(ws);
            }
        }

        // 4. Remove sample users
        for (String email : sampleEmails) {
            userRepository.findByEmailIgnoreCase(email).ifPresent(userRepository::delete);
        }

        System.out.println("[DataInitializer] Purged legacy sample personas from MongoDB.");
    }

    /**
     * Ensures clean super administrator account exists.
     */
    private void bootstrapSuperAdmin() {
        if (userRepository.findByEmailIgnoreCase(adminEmail).isEmpty()) {
            User admin = new User("System Administrator", adminEmail, passwordEncoder.encode(adminPassword), UserRole.SUPER_ADMIN);
            admin.setDepartment("Academic Computing Services");
            userRepository.save(admin);
            auditLogRepository.save(new AuditLog(
                "sys-bootstrap",
                "System Bootstrapper",
                "SYSTEM_BOOTSTRAP_ADMIN",
                "USER",
                admin.getId(),
                "Initialized clean super administrator account."
            ));
        }
    }
}
