package com.workshophub.repository;

import com.workshophub.model.Registration;
import com.workshophub.model.enums.RegistrationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends MongoRepository<Registration, String> {

    List<Registration> findByWorkshopId(String workshopId);

    List<Registration> findByParticipantId(String participantId);

    List<Registration> findByParticipantIdOrderByRegisteredAtDesc(String participantId);

    List<Registration> findByWorkshopIdAndStatus(String workshopId, RegistrationStatus status);

    Optional<Registration> findByWorkshopIdAndParticipantIdAndStatus(
            String workshopId,
            String participantId,
            RegistrationStatus status
    );

    long countByWorkshopIdAndStatus(String workshopId, RegistrationStatus status);

    long countByStatus(RegistrationStatus status);

    Optional<Registration> findByTicketCode(String ticketCode);

    Optional<Registration> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Registration> findByPaymentAttemptId(String paymentAttemptId);

    List<Registration> findByWorkshopIdAndStatusIn(String workshopId, List<RegistrationStatus> statuses);

    long countByWorkshopIdAndStatusIn(String workshopId, List<RegistrationStatus> statuses);
}
