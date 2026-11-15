package com.workshophub.controller;

import com.workshophub.model.Workshop;
import com.workshophub.service.WorkshopService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * Controller serving public discovery pages and workshop details.
 */
@Controller
public class HomeController {

    private final WorkshopService workshopService;

    public HomeController(WorkshopService workshopService) {
        this.workshopService = workshopService;
    }

    @GetMapping({"/", "/home"})
    public String home() {
        return "forward:/index.html";
    }

    @GetMapping("/legacy")
    public String legacyHome(Model model) {
        List<Workshop> published = workshopService.findAllPublished();
        model.addAttribute("workshops", published);
        model.addAttribute("featuredWorkshops", published.stream().limit(3).toList());
        return "public/index";
    }

    @GetMapping("/workshops")
    public String workshopCatalog(@RequestParam(value = "category", required = false) String category,
                                  @RequestParam(value = "q", required = false) String searchQuery,
                                  Model model) {
        List<Workshop> workshops = workshopService.findAllPublished();

        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("All")) {
            workshops = workshops.stream()
                .filter(w -> category.equalsIgnoreCase(w.getCategory()))
                .toList();
        }

        if (searchQuery != null && !searchQuery.isBlank()) {
            String q = searchQuery.toLowerCase();
            workshops = workshops.stream()
                .filter(w -> w.getTitle().toLowerCase().contains(q)
                    || w.getSummary().toLowerCase().contains(q)
                    || w.getOrganizerNameSnapshot().toLowerCase().contains(q))
                .toList();
        }

        model.addAttribute("workshops", workshops);
        model.addAttribute("selectedCategory", category != null ? category : "All");
        model.addAttribute("searchQuery", searchQuery != null ? searchQuery : "");
        return "public/workshops";
    }

    @GetMapping("/workshops/{id}")
    public String workshopDetails(@PathVariable("id") String id, Model model) {
        Workshop workshop = workshopService.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Workshop not found: " + id));

        long attendeeCount = workshopService.getActiveAttendeeCount(id);
        int availableSeats = workshopService.getAvailableSeats(workshop);
        boolean isFull = workshopService.isWorkshopFull(workshop);

        model.addAttribute("workshop", workshop);
        model.addAttribute("attendeeCount", attendeeCount);
        model.addAttribute("availableSeats", availableSeats);
        model.addAttribute("isFull", isFull);

        return "public/workshop-details";
    }

    @GetMapping("/viva-guide")
    public String vivaGuide(Model model) {
        return "public/viva-guide";
    }
}
