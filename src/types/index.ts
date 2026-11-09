export type UserRole = 'PARTICIPANT' | 'ORGANIZER' | 'SUPER_ADMIN' | 'VOLUNTEER';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';
export type WorkshopStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type RegistrationStatus = 'CONFIRMED' | 'CANCELLED' | 'ATTENDED' | 'PENDING_PAYMENT';
export type PricingType = 'FREE' | 'PAID';
export type PaymentStatus =
  | 'NOT_REQUIRED'
  | 'CREATED'
  | 'ORDER_CREATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  organizerId: string;
  organizerName: string;
  assignedWorkshopId: string;
  assignedWorkshopTitle: string;
  accessCode?: string; // e.g. "VOL-849201" (set once approved)
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REVOKED' | 'REJECTED';
  requestNote?: string;
  createdAt: string;
  lastActiveAt?: string;
  totalScanned?: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt?: string;
  department?: string;
}

export interface Workshop {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  bannerImageUrl: string;
  bannerImagePublicId?: string;
  organizerId: string;
  organizerNameSnapshot: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string;
  venueAddress?: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
  onlineMode: boolean;
  meetingLink?: string;
  capacity: number;
  registrationDeadline: string; // YYYY-MM-DD
  learningOutcomes: string[];
  status: WorkshopStatus;
  
  // Registration & Pricing Configuration
  pricingType: PricingType;
  price: number; // in INR (0 for free)
  currency: string; // "INR"
  pricingUpdatedAt?: string;
  pricingUpdatedBy?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  workshopId: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  registeredAt: string;
  status: RegistrationStatus;
  updatedAt: string;
  notes?: string;
  ticketCode?: string;
  verified?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;

  // Pricing Snapshot & Payment Status
  pricingTypeSnapshot?: PricingType;
  amount?: number;
  currency?: string;
  paymentStatus?: PaymentStatus;
  paymentAttemptId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  reservationExpiresAt?: string;
  confirmedAt?: string;
  cancelledAt?: string;
}

export interface PaymentAttempt {
  id: string;
  registrationId: string;
  workshopId: string;
  workshopTitle: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number; // in paise
  amountInRupees: number; // in INR
  currency: string;
  status: PaymentStatus;
  signatureVerified: boolean;
  webhookVerified: boolean;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  action: string;
  entityType: 'USER' | 'WORKSHOP' | 'REGISTRATION';
  entityId: string;
  createdAt: string;
  shortDescription: string;
}

export interface WorkshopFormData {
  title: string;
  summary: string;
  description: string;
  category: string;
  bannerImageUrl: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  venueAddress?: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
  onlineMode: boolean;
  meetingLink?: string;
  capacity: number;
  registrationDeadline: string;
  learningOutcomes: string;
  status: WorkshopStatus;

  // Pricing
  pricingType: PricingType;
  price: number;
  currency?: string;
}
