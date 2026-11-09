package com.workshophub.repository;

import com.workshophub.model.PaymentAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentAttemptRepository extends MongoRepository<PaymentAttempt, String> {

    Optional<PaymentAttempt> findByRazorpayOrderId(String razorpayOrderId);

    Optional<PaymentAttempt> findByRazorpayPaymentId(String razorpayPaymentId);

    List<PaymentAttempt> findByParticipantIdOrderByCreatedAtDesc(String participantId);

    List<PaymentAttempt> findByWorkshopIdOrderByCreatedAtDesc(String workshopId);

    Optional<PaymentAttempt> findByRegistrationId(String registrationId);
}

