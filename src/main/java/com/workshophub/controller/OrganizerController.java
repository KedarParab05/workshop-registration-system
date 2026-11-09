package com.workshophub.controller;

import com.workshophub.model.Registration;
import com.workshophub.model.User;
import com.workshophub.model.Workshop;
import com.workshophub.service.ImageStorageService;
import com.workshophub.service.RegistrationService;
import com.workshophub.service.UserService;
import com.workshophub.service.WorkshopService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

/**
 * Controller handling organizer dashboard, workshop CRUD, and attendee export.
 */
@Controller
@RequestMapping("/organizer")
public class OrganizerController {

    private final WorkshopService workshopService;
    private final RegistrationService registrationService;
    private final UserService userService;
    private final ImageStorageService imageStorageService;

    public OrganizerController(WorkshopService workshopService,
                               RegistrationService registrationService,
                               UserService userService,
                               ImageStorageService imageStorageService) {
        this.workshopService = workshopService;
        this.registrationService = registrationService;
        this.userService = userService;
        this.imageStorageService = imageStorageService;
    }

    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User organizer = getOrganizer(userDetails);
        List<Workshop> myWorkshops = workshopService.findByOrganizerId(organizer.getId());
        model.addAttribute("workshops", myWorkshops);
        model.addAttribute("organizer", organizer);
        return "organizer/dashboard";
    }

    @GetMapping("/workshops")
    public String manageWorkshops(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User organizer = getOrganizer(userDetails);
        List<Workshop> myWorkshops = workshopService.findByOrganizerId(organizer.getId());
        model.addAttribute("workshops", myWorkshops);
        return "organizer/manage-workshops";
    }

    @GetMapping("/workshops/create")
    public String showCreateForm(Model model) {
        model.addAttribute("workshop", new Workshop());
        return "organizer/workshop-form";
    }

    @PostMapping("/workshops/create")
    public String handleCreate(@ModelAttribute Workshop workshop,
                               @RequestParam(value = "bannerFile", required = false) MultipartFile bannerFile,
                               @AuthenticationPrincipal UserDetails userDetails,
                               RedirectAttributes redirectAttributes) {
        try {
            User organizer = getOrganizer(userDetails);

            if (bannerFile != null && !bannerFile.isEmpty()) {
                Map<String, String> upload = imageStorageService.uploadBanner(bannerFile);
                workshop.setBannerImageUrl(upload.get("url"));
                workshop.setBannerImagePublicId(upload.get("public_id"));
            }

            workshopService.createWorkshop(workshop, organizer);
            redirectAttributes.addFlashAttribute("successMessage", "Workshop created successfully!");
            return "redirect:/organizer/workshops";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/organizer/workshops/create";
        }
    }

    @PostMapping("/workshops/{id}/delete")
    public String handleDelete(@PathVariable("id") String workshopId,
                               @AuthenticationPrincipal UserDetails userDetails,
                               RedirectAttributes redirectAttributes) {
        try {
            User organizer = getOrganizer(userDetails);
            workshopService.deleteOrCancelWorkshop(workshopId, organizer);
            redirectAttributes.addFlashAttribute("successMessage", "Workshop removed or cancelled safely.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/organizer/workshops";
    }

    @GetMapping("/registrations")
    public String attendeeRoster(@RequestParam(value = "workshopId", required = false) String workshopId,
                                 @AuthenticationPrincipal UserDetails userDetails,
                                 Model model) {
        User organizer = getOrganizer(userDetails);
        List<Workshop> myWorkshops = workshopService.findByOrganizerId(organizer.getId());

        List<Registration> registrations;
        if (workshopId != null && !workshopId.isBlank()) {
            registrations = registrationService.findByWorkshop(workshopId);
        } else {
            registrations = myWorkshops.stream()
                .flatMap(w -> registrationService.findByWorkshop(w.getId()).stream())
                .toList();
        }

        model.addAttribute("workshops", myWorkshops);
        model.addAttribute("registrations", registrations);
        model.addAttribute("selectedWorkshopId", workshopId);
        return "organizer/registrations";
    }

    @GetMapping("/registrations/export-csv")
    public void exportCsv(@RequestParam(value = "workshopId", required = false) String workshopId,
                          @AuthenticationPrincipal UserDetails userDetails,
                          HttpServletResponse response) throws IOException {
        User organizer = getOrganizer(userDetails);
        List<Workshop> myWorkshops = workshopService.findByOrganizerId(organizer.getId());

        List<Registration> registrations = (workshopId != null && !workshopId.isBlank())
            ? registrationService.findByWorkshop(workshopId)
            : myWorkshops.stream().flatMap(w -> registrationService.findByWorkshop(w.getId()).stream()).toList();

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"workshophub_attendees.csv\"");

        PrintWriter writer = response.getWriter();
        writer.println("Registration ID,Workshop ID,Participant Name,Email,Date,Status");
        for (Registration r : registrations) {
            writer.println(String.format("%s,%s,\"%s\",%s,%s,%s",
                r.getId(), r.getWorkshopId(), r.getParticipantName(), r.getParticipantEmail(), r.getRegisteredAt(), r.getStatus()));
        }
        writer.flush();
    }

    private User getOrganizer(UserDetails userDetails) {
        if (userDetails == null) {
            throw new SecurityException("Authentication required");
        }
        return userService.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new SecurityException("Organizer not found"));
    }
}
