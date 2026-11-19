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
import java.util.Optional;

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

    @Value("${workshophub.admin.password:}")
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
            ensureAllWorkshopsUseRazorpay();
        } catch (Exception e) {
            System.out.println("[DataInitializer] Message: " + e.getMessage());
        }
    }

    /**
     * Sanitizes workshop titles and ensures pricing is properly configured.
     */
    private void ensureAllWorkshopsUseRazorpay() {
        for (Workshop ws : workshopRepository.findAll()) {
            boolean modified = false;

            String title = ws.getTitle();
            if (title != null) {
                String cleanTitle = title
                    .replace("Full-Stack Web Development with React 19 & Spring Boot", "Full-Stack Web Application Engineering")
                    .replace("Practical AI: Deep Learning & Neural Architecture Studio", "Applied Artificial Intelligence & Neural Architecture Studio")
                    .replace("Cloud Computing & AWS Architecture Fundamentals", "Cloud Infrastructure & Distributed Systems Engineering")
                    .replace("Cybersecurity, Network Defense & Ethical Hacking", "Cybersecurity & Defensive Infrastructure Engineering")
                    .replace("Advanced Java Programming & Enterprise Design Patterns", "Enterprise Software Engineering & Architectural Design Patterns")
                    .replace("IoT & Embedded Systems with ESP32 & MQTT", "Connected Devices & Embedded Systems Engineering")
                    .replace("Database Management & SQL Performance Masterclass", "Database Systems & High-Performance Data Engineering")
                    .replace("DevOps & Docker Containerization Fundamentals", "DevOps & Container Infrastructure Engineering")
                    .replace("Data Structures & Competitive Algorithms in Java", "Advanced Data Structures & Algorithmic Problem Solving")
                    .replace("Building Production REST APIs with Spring Boot 3", "Enterprise REST API Architecture & Service Engineering")
                    .replace("Cloud & DevOps Engineering: From Code to Cloud", "Cloud Infrastructure Engineering: Code to Cloud")
                    .replace("Devops", "Cloud Infrastructure Operations");
                if (!cleanTitle.equals(title)) {
                    ws.setTitle(cleanTitle);
                    modified = true;
                }
            }

            // Keep pricing model as configured (FREE or PAID)
            if (ws.getPricingType() == com.workshophub.model.enums.PricingType.FREE) {
                if (ws.getPrice() == null || ws.getPrice() != 0.0) {
                    ws.setPrice(0.0);
                    modified = true;
                }
            } else if (ws.getPricingType() == com.workshophub.model.enums.PricingType.PAID) {
                if (ws.getPrice() == null || ws.getPrice() <= 0) {
                    ws.setPrice(199.0);
                    modified = true;
                }
            }

            if (modified) {
                workshopRepository.save(ws);
                System.out.println("[DataInitializer] Updated workshop: " + ws.getTitle() + " (" + ws.getPricingType() + " - ₹" + ws.getPrice() + ")");
            }
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
     * Ensures clean super administrator account exists with guaranteed known password.
     */
    private void bootstrapSuperAdmin() {
        String defaultPass = "Admin@Kaushalya2026";
        String initialPass = (adminPassword != null && !adminPassword.isBlank())
            ? adminPassword.trim()
            : defaultPass;

        Optional<User> existing = userRepository.findByEmailIgnoreCase(adminEmail);
        if (existing.isEmpty()) {
            User admin = new User("System Administrator", adminEmail, passwordEncoder.encode(initialPass), UserRole.SUPER_ADMIN);
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
        } else {
            // Ensure super admin has valid password hash
            User admin = existing.get();
            if (admin.getPasswordHash() == null || admin.getPasswordHash().isBlank()) {
                admin.setPasswordHash(passwordEncoder.encode(initialPass));
                userRepository.save(admin);
            }
        }
    }
}
