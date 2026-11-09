package com.workshophub.repository;

import com.workshophub.model.Volunteer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerRepository extends MongoRepository<Volunteer, String> {

    List<Volunteer> findByOrganizerId(String organizerId);

    List<Volunteer> findByAssignedWorkshopId(String assignedWorkshopId);

    Optional<Volunteer> findByAccessCode(String accessCode);

    Optional<Volunteer> findByOrganizerIdAndAccessCode(String organizerId, String accessCode);

    List<Volunteer> findByEmailIgnoreCase(String email);

    Optional<Volunteer> findByEmailIgnoreCaseAndAssignedWorkshopId(String email, String assignedWorkshopId);
}

