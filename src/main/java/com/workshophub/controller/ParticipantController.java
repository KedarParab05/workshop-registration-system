package com.workshophub.controller;

import com.workshophub.model.Registration;
import com.workshophub.model.User;
import com.workshophub.model.Workshop;
import com.workshophub.service.RegistrationService;
import com.workshophub.service.UserService;
import com.workshophub.service.WorkshopService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

/**
 * Controller handling participant bookings, cancellation, and dashboards.
 */
@Controller
public class ParticipantController {

    private final RegistrationService registrationService;
    private final WorkshopService workshopService;
    private final UserService userService;

    public ParticipantController(RegistrationService registrationService,
                                 WorkshopService workshopService,
                                 UserService userService) {
        this.registrationService = registrationService;
        this.workshopService = workshopService;
        this.userService = userService;
    }

    @GetMapping("/participant/dashboard")
    public String dashboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User user = getUser(userDetails);
        List<Registration> registrations = registrationService.findByParticipant(user.getId());
        model.addAttribute("registrations", registrations);
        model.addAttribute("user", user);
        return "participant/dashboard";
    }

    @GetMapping("/my-registrations")
    public String myRegistrations(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User user = getUser(userDetails);
        List<Registration> registrations = registrationService.findByParticipant(user.getId());
        model.addAttribute("registrations", registrations);
        return "participant/my-registrations";
    }

    @PostMapping("/workshops/{id}/register")
    public String registerForWorkshop(@PathVariable("id") String workshopId,
                                      @RequestParam(value = "notes", required = false) String notes,
                                      @AuthenticationPrincipal UserDetails userDetails,
                                      RedirectAttributes redirectAttributes) {
        try {
            User user = getUser(userDetails);
            registrationService.registerParticipant(workshopId, user, notes);
            redirectAttributes.addFlashAttribute("successMessage", "Registration confirmed! Your seat is reserved for free.");
            return "redirect:/my-registrations";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/workshops/" + workshopId;
        }
    }

    @PostMapping("/registrations/{id}/cancel")
    public String cancelRegistration(@PathVariable("id") String registrationId,
                                     @AuthenticationPrincipal UserDetails userDetails,
                                     RedirectAttributes redirectAttributes) {
        try {
            User user = getUser(userDetails);
            registrationService.cancelRegistration(registrationId, user);
            redirectAttributes.addFlashAttribute("successMessage", "Registration cancelled. Your seat was restored to available capacity.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/my-registrations";
    }

    private User getUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new SecurityException("Authentication required");
        }
        return userService.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new SecurityException("User not found"));
    }
}
