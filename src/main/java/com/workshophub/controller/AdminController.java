package com.workshophub.controller;

import com.workshophub.model.AuditLog;
import com.workshophub.model.Registration;
import com.workshophub.model.User;
import com.workshophub.model.Workshop;
import com.workshophub.model.enums.UserRole;
import com.workshophub.repository.AuditLogRepository;
import com.workshophub.service.RegistrationService;
import com.workshophub.service.UserService;
import com.workshophub.service.WorkshopService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

/**
 * Controller for platform Super Administrator governance.
 */
@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final WorkshopService workshopService;
    private final RegistrationService registrationService;
    private final AuditLogRepository auditLogRepository;

    public AdminController(UserService userService,
                           WorkshopService workshopService,
                           RegistrationService registrationService,
                           AuditLogRepository auditLogRepository) {
        this.userService = userService;
        this.workshopService = workshopService;
        this.registrationService = registrationService;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        List<User> users = userService.findAll();
        List<Workshop> workshops = workshopService.findAll();
        List<Registration> registrations = registrationService.findAll();
        List<AuditLog> auditLogs = auditLogRepository.findTop20ByOrderByCreatedAtDesc();

        model.addAttribute("totalUsers", users.size());
        model.addAttribute("totalWorkshops", workshops.size());
        model.addAttribute("totalRegistrations", registrations.size());
        model.addAttribute("auditLogs", auditLogs);

        return "admin/dashboard";
    }

    @GetMapping("/users")
    public String manageUsers(Model model) {
        model.addAttribute("users", userService.findAll());
        return "admin/users";
    }

    @PostMapping("/users/{id}/toggle-status")
    public String toggleStatus(@PathVariable("id") String userId,
                               @AuthenticationPrincipal UserDetails userDetails,
                               RedirectAttributes redirectAttributes) {
        try {
            User admin = getAdmin(userDetails);
            userService.toggleAccountStatus(userId, admin);
            redirectAttributes.addFlashAttribute("successMessage", "User account status updated.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/admin/users";
    }

    @PostMapping("/users/{id}/change-role")
    public String changeRole(@PathVariable("id") String userId,
                             @RequestParam("role") String role,
                             @AuthenticationPrincipal UserDetails userDetails,
                             RedirectAttributes redirectAttributes) {
        try {
            User admin = getAdmin(userDetails);
            UserRole newRole = UserRole.valueOf(role);
            userService.changeUserRole(userId, newRole, admin);
            redirectAttributes.addFlashAttribute("successMessage", "User role updated successfully.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/admin/users";
    }

    @GetMapping("/workshops")
    public String manageWorkshops(Model model) {
        model.addAttribute("workshops", workshopService.findAll());
        return "admin/workshops";
    }

    @GetMapping("/registrations")
    public String manageRegistrations(Model model) {
        model.addAttribute("registrations", registrationService.findAll());
        return "admin/registrations";
    }

    private User getAdmin(UserDetails userDetails) {
        if (userDetails == null) {
            return userService.findByEmail("admin@workshophub.edu").orElse(new User("Admin", "admin@workshophub.edu", "", null));
        }
        return userService.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new SecurityException("Admin user not found"));
    }
}
