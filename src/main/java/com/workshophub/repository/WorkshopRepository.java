package com.workshophub.repository;

import com.workshophub.model.Workshop;
import com.workshophub.model.enums.WorkshopStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkshopRepository extends MongoRepository<Workshop, String> {

    List<Workshop> findByStatus(WorkshopStatus status);

    List<Workshop> findByOrganizerId(String organizerId);

    List<Workshop> findByCategory(String category);

    List<Workshop> findByStatusAndCategory(WorkshopStatus status, String category);

    long countByStatus(WorkshopStatus status);
}
