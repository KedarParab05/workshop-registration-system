package com.workshophub.model.enums;

public enum PaymentStatus {
    NOT_REQUIRED,       // For Free workshops
    CREATED,            // Initial internal payment record created
    ORDER_CREATED,      // Razorpay order created
    PENDING,            // Awaiting verification or webhook
    SUCCESS,            // Payment verified & captured
    FAILED,             // Payment failed / signature mismatch
    CANCELLED,          // Checkout cancelled or closed
    REFUND_PENDING,     // Refund initiated
    REFUNDED            // Refund successful
}

