package com.workshophub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.workshophub.model.AuditLog;
import com.workshophub.model.PaymentAttempt;
import com.workshophub.model.Registration;
import com.workshophub.model.User;
import com.workshophub.model.WebhookEvent;
import com.workshophub.model.Workshop;
import com.workshophub.model.enums.AccountStatus;
import com.workshophub.model.enums.PaymentStatus;
import com.workshophub.model.enums.PricingType;
import com.workshophub.model.enums.RegistrationStatus;
import com.workshophub.model.enums.UserRole;
import com.workshophub.model.enums.WorkshopStatus;
import com.workshophub.repository.AuditLogRepository;
import com.workshophub.repository.PaymentAttemptRepository;
import com.workshophub.repository.RegistrationRepository;
import com.workshophub.repository.WebhookEventRepository;
import com.workshophub.repository.WorkshopRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Service managing Paid workshop registrations, Razorpay order creation,
 * cryptographic payment signature verification, webhook processing, and capacity reservations.
 */
@Service
public class PaymentService {

    private final RazorpayService razorpayService;
    private final RegistrationRepository registrationRepository;
    private final WorkshopRepository workshopRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final WebhookEventRepository webhookEventRepository;
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PaymentService(RazorpayService razorpayService,
                          RegistrationRepository registrationRepository,
                          WorkshopRepository workshopRepository,
                          PaymentAttemptRepository paymentAttemptRepository,
                          WebhookEventRepository webhookEventRepository,
                          AuditLogRepository auditLogRepository) {
        this.razorpayService = razorpayService;
        this.registrationRepository = registrationRepository;
        this.workshopRepository = workshopRepository;
        this.paymentAttemptRepository = paymentAttemptRepository;
        this.webhookEventRepository = webhookEventRepository;
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Initiates checkout for a paid workshop:
     * 1. Validates workshop is PUBLISHED, PAID, and has price > 0.
     * 2. Checks capacity (accounting for active confirmed + pending unexpired reservations).
     * 3. Creates a PENDING_PAYMENT registration record reserving the seat for 15 minutes.
     * 4. Creates a Razorpay Order server-side.
     * 5. Returns public checkout info (keyId, orderId, amount in paise, currency).
     */
    public synchronized Map<String, Object> createCheckoutOrder(String workshopId, User participant, String notes) throws Exception {
        if (participant == null) {
            throw new SecurityException("Authentication required to register for workshops.");
        }
        if (participant.getAccountStatus() == AccountStatus.SUSPENDED) {
            throw new SecurityException("Your account is suspended. Registration blocked.");
        }

        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new IllegalArgumentException("Workshop not found: " + workshopId));

        if (workshop.getStatus() != WorkshopStatus.PUBLISHED) {
            throw new IllegalStateException("Workshop is not accepting registrations (status: " + workshop.getStatus() + ").");
        }

        if (workshop.getPricingType() != PricingType.PAID || workshop.getPrice() == null || workshop.getPrice() <= 0) {
            throw new IllegalStateException("This workshop is not configured as a paid session.");
        }

        // Clean up expired reservations for this workshop to ensure accurate capacity
        releaseExpiredReservations(workshopId);

        // Check duplicate active registration
        Optional<Registration> existingConfirmed = registrationRepository.findByWorkshopIdAndParticipantIdAndStatus(
                workshopId, participant.getId(), RegistrationStatus.CONFIRMED
        );
        if (existingConfirmed.isPresent()) {
            throw new IllegalStateException("You are already registered for this workshop.");
        }

        // Capacity calculation: confirmed + attended + active unexpired reservations
        long activeAttendees = registrationRepository.countByWorkshopIdAndStatus(workshopId, RegistrationStatus.CONFIRMED)
                + registrationRepository.countByWorkshopIdAndStatus(workshopId, RegistrationStatus.ATTENDED);
        List<Registration> pendingRegs = registrationRepository.findByWorkshopIdAndStatus(workshopId, RegistrationStatus.PENDING_PAYMENT);
        long activeReservations = pendingRegs.stream()
                .filter(r -> r.getReservationExpiresAt() == null || r.getReservationExpiresAt().isAfter(LocalDateTime.now()))
                .count();

        if ((activeAttendees + activeReservations) >= workshop.getCapacity()) {
            throw new IllegalStateException("This workshop is fully booked (Capacity of " + workshop.getCapacity() + " reached).");
        }

        // Calculate amount in paise (1 INR = 100 paise)
        long amountInPaise = Math.round(workshop.getPrice() * 100);

        // Create pending reservation registration
        Registration pendingReg = new Registration(
                workshopId,
                participant.getId(),
                participant.getFullName(),
                participant.getEmail()
        );
        pendingReg.setStatus(RegistrationStatus.PENDING_PAYMENT);
        pendingReg.setPaymentStatus(PaymentStatus.CREATED);
        pendingReg.setPricingTypeSnapshot(PricingType.PAID);
        pendingReg.setAmount(workshop.getPrice());
        pendingReg.setCurrency("INR");
        pendingReg.setNotes(notes);
        pendingReg.setReservationExpiresAt(LocalDateTime.now().plusMinutes(15));
        Registration savedReg = registrationRepository.save(pendingReg);

        // Create internal PaymentAttempt
        String paymentAttemptId = "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-" + (System.currentTimeMillis() % 10000);
        PaymentAttempt attempt = new PaymentAttempt(
                paymentAttemptId,
                savedReg.getId(),
                workshopId,
                workshop.getTitle(),
                participant.getId(),
                participant.getFullName(),
                participant.getEmail(),
                amountInPaise,
                workshop.getPrice()
        );
        attempt.setStatus(PaymentStatus.CREATED);
        paymentAttemptRepository.save(attempt);

        // Call Razorpay API to create an Order
        Map<String, String> orderNotes = Map.of(
                "workshopId", workshopId,
                "workshopTitle", workshop.getTitle().substring(0, Math.min(40, workshop.getTitle().length())),
                "participantId", participant.getId(),
                "registrationId", savedReg.getId(),
                "paymentAttemptId", paymentAttemptId
        );

        String razorpayOrderId;
        try {
            razorpayOrderId = razorpayService.createOrder(amountInPaise, "INR", "rcpt_" + savedReg.getId(), orderNotes);
        } catch (Exception e) {
            // If order creation failed, remove pending registration and attempt
            registrationRepository.delete(savedReg);
            paymentAttemptRepository.delete(attempt);
            throw new IllegalStateException("Failed to initialize payment gateway: " + e.getMessage());
        }

        // Update with order ID
        savedReg.setRazorpayOrderId(razorpayOrderId);
        savedReg.setPaymentAttemptId(paymentAttemptId);
        savedReg.setPaymentStatus(PaymentStatus.ORDER_CREATED);
        registrationRepository.save(savedReg);

        attempt.setRazorpayOrderId(razorpayOrderId);
        attempt.setStatus(PaymentStatus.ORDER_CREATED);
        attempt.setUpdatedAt(LocalDateTime.now());
        paymentAttemptRepository.save(attempt);

        auditLogRepository.save(new AuditLog(
                participant.getId(),
                participant.getFullName(),
                "PAID_CHECKOUT_INITIATED",
                "REGISTRATION",
                savedReg.getId(),
                "Initiated Razorpay checkout for '" + workshop.getTitle() + "' (₹" + workshop.getPrice() + ")"
        ));

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("keyId", razorpayService.getKeyId());
        response.put("orderId", razorpayOrderId);
        response.put("amount", amountInPaise);
        response.put("currency", "INR");
        response.put("workshopTitle", workshop.getTitle());
        response.put("participantName", participant.getFullName());
        response.put("participantEmail", participant.getEmail());
        response.put("paymentAttemptId", paymentAttemptId);
        response.put("registrationId", savedReg.getId());
        response.put("priceInRupees", workshop.getPrice());
        response.put("mode", razorpayService.getMode());

        return response;
    }

    /**
     * Verifies payment signature returned by Razorpay Checkout and confirms registration.
     */
    public synchronized Registration verifyPayment(String paymentAttemptId,
                                                    String razorpayOrderId,
                                                    String razorpayPaymentId,
                                                    String razorpaySignature,
                                                    User currentUser) {
        if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
            throw new IllegalArgumentException("Missing required payment verification parameters.");
        }

        // Locate PaymentAttempt
        PaymentAttempt attempt = null;
        if (paymentAttemptId != null && !paymentAttemptId.isBlank()) {
            attempt = paymentAttemptRepository.findById(paymentAttemptId).orElse(null);
        }
        if (attempt == null) {
            attempt = paymentAttemptRepository.findByRazorpayOrderId(razorpayOrderId)
                    .orElseThrow(() -> new IllegalArgumentException("Payment attempt record not found for order: " + razorpayOrderId));
        }

        // Locate Registration
        Registration reg = registrationRepository.findById(attempt.getRegistrationId())
                .orElseThrow(() -> new IllegalArgumentException("Associated registration record not found."));

        // Idempotency: If already confirmed, return safely
        if (reg.getStatus() == RegistrationStatus.CONFIRMED && reg.getPaymentStatus() == PaymentStatus.SUCCESS) {
            return reg;
        }

        // Verify cryptographic HMAC-SHA256 signature
        boolean signatureValid = razorpayService.verifyCheckoutSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (!signatureValid) {
            attempt.setStatus(PaymentStatus.FAILED);
            attempt.setFailureReason("Cryptographic signature mismatch.");
            attempt.setUpdatedAt(LocalDateTime.now());
            paymentAttemptRepository.save(attempt);

            reg.setPaymentStatus(PaymentStatus.FAILED);
            reg.setUpdatedAt(LocalDateTime.now());
            registrationRepository.save(reg);

            auditLogRepository.save(new AuditLog(
                    currentUser != null ? currentUser.getId() : attempt.getParticipantId(),
                    currentUser != null ? currentUser.getFullName() : attempt.getParticipantName(),
                    "PAYMENT_VERIFICATION_FAILED",
                    "REGISTRATION",
                    reg.getId(),
                    "Signature mismatch for order " + razorpayOrderId
            ));

            throw new IllegalArgumentException("Payment verification failed: Invalid cryptographic signature.");
        }

        // Signature is valid: Confirm payment and registration
        attempt.setStatus(PaymentStatus.SUCCESS);
        attempt.setSignatureVerified(true);
        attempt.setRazorpayPaymentId(razorpayPaymentId);
        attempt.setPaidAt(LocalDateTime.now());
        attempt.setUpdatedAt(LocalDateTime.now());
        paymentAttemptRepository.save(attempt);

        reg.setStatus(RegistrationStatus.CONFIRMED);
        reg.setPaymentStatus(PaymentStatus.SUCCESS);
        reg.setRazorpayPaymentId(razorpayPaymentId);
        reg.setRazorpayOrderId(razorpayOrderId);
        reg.setConfirmedAt(LocalDateTime.now());
        reg.setUpdatedAt(LocalDateTime.now());

        // Generate one-time cryptographic QR ticket code
        String uniqueTicket = "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-" + (System.currentTimeMillis() % 10000);
        reg.setTicketCode(uniqueTicket);
        reg.setVerified(false);

        Registration confirmedReg = registrationRepository.save(reg);

        auditLogRepository.save(new AuditLog(
                currentUser != null ? currentUser.getId() : attempt.getParticipantId(),
                currentUser != null ? currentUser.getFullName() : attempt.getParticipantName(),
                "REGISTRATION_PAID_CONFIRMED",
                "REGISTRATION",
                confirmedReg.getId(),
                "Paid registration confirmed for " + attempt.getWorkshopTitle() + " (₹" + attempt.getAmountInRupees() + ", Ref: " + razorpayPaymentId + ")"
        ));

        return confirmedReg;
    }

    /**
     * Processes Razorpay Webhook events asynchronously with cryptographic signature validation and idempotency.
     */
    public synchronized Map<String, Object> processWebhook(String rawPayload, String signatureHeader) {
        if (!razorpayService.verifyWebhookSignature(rawPayload, signatureHeader)) {
            throw new SecurityException("Invalid Razorpay webhook signature.");
        }

        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            String eventId = root.path("id").asText();
            String eventType = root.path("event").asText();

            // Check if already processed (Idempotency)
            if (eventId != null && !eventId.isBlank() && webhookEventRepository.existsByEventId(eventId)) {
                return Map.of("success", true, "message", "Event already processed.", "duplicate", true);
            }

            WebhookEvent webhookEvent = new WebhookEvent(eventId, eventType, rawPayload, true);
            webhookEventRepository.save(webhookEvent);

            if ("order.paid".equalsIgnoreCase(eventType) || "payment.captured".equalsIgnoreCase(eventType)) {
                JsonNode paymentEntity = root.path("payload").path("payment").path("entity");
                String orderId = paymentEntity.path("order_id").asText();
                String paymentId = paymentEntity.path("id").asText();

                if (orderId != null && !orderId.isBlank()) {
                    Optional<PaymentAttempt> optAttempt = paymentAttemptRepository.findByRazorpayOrderId(orderId);
                    if (optAttempt.isPresent()) {
                        PaymentAttempt attempt = optAttempt.get();
                        if (attempt.getStatus() != PaymentStatus.SUCCESS) {
                            attempt.setStatus(PaymentStatus.SUCCESS);
                            attempt.setWebhookVerified(true);
                            attempt.setRazorpayPaymentId(paymentId);
                            attempt.setPaidAt(LocalDateTime.now());
                            attempt.setUpdatedAt(LocalDateTime.now());
                            paymentAttemptRepository.save(attempt);

                            Registration reg = registrationRepository.findById(attempt.getRegistrationId()).orElse(null);
                            if (reg != null && reg.getStatus() != RegistrationStatus.CONFIRMED) {
                                reg.setStatus(RegistrationStatus.CONFIRMED);
                                reg.setPaymentStatus(PaymentStatus.SUCCESS);
                                reg.setRazorpayPaymentId(paymentId);
                                reg.setConfirmedAt(LocalDateTime.now());
                                String ticket = "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-" + (System.currentTimeMillis() % 10000);
                                reg.setTicketCode(ticket);
                                reg.setVerified(false);
                                registrationRepository.save(reg);
                            }
                        }
                    }
                }
            } else if ("payment.failed".equalsIgnoreCase(eventType)) {
                JsonNode paymentEntity = root.path("payload").path("payment").path("entity");
                String orderId = paymentEntity.path("order_id").asText();
                String errorDesc = paymentEntity.path("error_description").asText("Payment failed at bank.");

                if (orderId != null && !orderId.isBlank()) {
                    paymentAttemptRepository.findByRazorpayOrderId(orderId).ifPresent(attempt -> {
                        attempt.setStatus(PaymentStatus.FAILED);
                        attempt.setFailureReason(errorDesc);
                        attempt.setUpdatedAt(LocalDateTime.now());
                        paymentAttemptRepository.save(attempt);
                    });
                }
            }

            webhookEvent.setProcessed(true);
            webhookEvent.setProcessResult("Successfully reconciled " + eventType);
            webhookEventRepository.save(webhookEvent);

            return Map.of("success", true, "message", "Webhook processed successfully.");
        } catch (Exception e) {
            throw new RuntimeException("Error processing webhook: " + e.getMessage(), e);
        }
    }

    /**
     * Returns financial and payment metrics for a specific workshop (for Organizer Studio).
     */
    public Map<String, Object> getWorkshopPaymentAnalytics(String workshopId, User organizer) {
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new IllegalArgumentException("Workshop not found: " + workshopId));

        if (organizer.getRole() != UserRole.SUPER_ADMIN && !workshop.getOrganizerId().equals(organizer.getId())) {
            throw new SecurityException("Unauthorized: You can only view analytics for your own workshops.");
        }

        List<Registration> allRegistrations = registrationRepository.findByWorkshopId(workshopId);

        long confirmedCount = allRegistrations.stream()
                .filter(r -> r.getStatus() == RegistrationStatus.CONFIRMED || r.getStatus() == RegistrationStatus.ATTENDED)
                .count();

        long paidRegistrationsCount = allRegistrations.stream()
                .filter(r -> (r.getStatus() == RegistrationStatus.CONFIRMED || r.getStatus() == RegistrationStatus.ATTENDED)
                        && r.getPaymentStatus() == PaymentStatus.SUCCESS)
                .count();

        long freeRegistrationsCount = confirmedCount - paidRegistrationsCount;

        double grossRevenue = allRegistrations.stream()
                .filter(r -> (r.getStatus() == RegistrationStatus.CONFIRMED || r.getStatus() == RegistrationStatus.ATTENDED)
                        && r.getPaymentStatus() == PaymentStatus.SUCCESS && r.getAmount() != null)
                .mapToDouble(Registration::getAmount)
                .sum();

        long pendingPaymentCount = allRegistrations.stream()
                .filter(r -> r.getStatus() == RegistrationStatus.PENDING_PAYMENT)
                .count();

        long cancelledCount = allRegistrations.stream()
                .filter(r -> r.getStatus() == RegistrationStatus.CANCELLED)
                .count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("workshopId", workshopId);
        summary.put("workshopTitle", workshop.getTitle());
        summary.put("pricingType", workshop.getPricingType());
        summary.put("unitPrice", workshop.getPrice());
        summary.put("totalConfirmedRegistrations", confirmedCount);
        summary.put("paidRegistrationsCount", paidRegistrationsCount);
        summary.put("freeRegistrationsCount", freeRegistrationsCount);
        summary.put("grossRevenue", grossRevenue);
        summary.put("pendingPaymentCount", pendingPaymentCount);
        summary.put("cancelledCount", cancelledCount);
        summary.put("currency", "INR");

        return summary;
    }

    /**
     * Cleans up expired reservations so held seats return to the available pool.
     */
    private void releaseExpiredReservations(String workshopId) {
        try {
            List<Registration> pendings = registrationRepository.findByWorkshopIdAndStatus(workshopId, RegistrationStatus.PENDING_PAYMENT);
            for (Registration reg : pendings) {
                if (reg.getReservationExpiresAt() != null && reg.getReservationExpiresAt().isBefore(LocalDateTime.now())) {
                    reg.setStatus(RegistrationStatus.CANCELLED);
                    reg.setNotes("Reservation expired before payment completion.");
                    reg.setUpdatedAt(LocalDateTime.now());
                    registrationRepository.save(reg);
                }
            }
        } catch (Exception ignored) {}
    }
}

