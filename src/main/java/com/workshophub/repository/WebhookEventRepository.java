package com.workshophub.repository;

import com.workshophub.model.WebhookEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WebhookEventRepository extends MongoRepository<WebhookEvent, String> {

    Optional<WebhookEvent> findByEventId(String eventId);

    boolean existsByEventId(String eventId);
}

