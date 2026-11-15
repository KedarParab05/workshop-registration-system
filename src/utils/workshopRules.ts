import { Workshop, Registration, User, WorkshopFormData } from '../types';

export interface SeatsInfo {
  registeredCount: number;
  availableSeats: number;
  isFull: boolean;
}

/**
 * Calculates current active seat counts from registrations.
 * Both CONFIRMED and ATTENDED registrations consume capacity.
 * Only CANCELLED registrations release seats.
 */
export function calculateSeats(workshop: Workshop, allRegistrations: Registration[]): SeatsInfo {
  const now = Date.now();
  const activeCount = allRegistrations.filter(
    (r) =>
      r.workshopId === workshop.id &&
      (r.status === 'CONFIRMED' ||
        r.status === 'ATTENDED' ||
        (r.status === 'PENDING_PAYMENT' && (!r.reservationExpiresAt || new Date(r.reservationExpiresAt).getTime() > now)))
  ).length;

  const available = Math.max(0, workshop.capacity - activeCount);
  return {
    registeredCount: activeCount,
    availableSeats: available,
    isFull: activeCount >= workshop.capacity,
  };
}

/**
 * Validates whether a participant can register for a given workshop.
 */
export function canRegister(
  workshop: Workshop,
  participant: User | null,
  allRegistrations: Registration[]
): { allowed: boolean; reason?: string } {
  if (!participant) {
    return { allowed: false, reason: 'You must log in to register for workshops.' };
  }

  if (participant.role !== 'PARTICIPANT') {
    return { allowed: false, reason: 'Only participant accounts can register for workshops.' };
  }

  if (participant.accountStatus !== 'ACTIVE') {
    return { allowed: false, reason: 'Your account is suspended. Please contact support.' };
  }

  if (workshop.status !== 'PUBLISHED') {
    return { allowed: false, reason: `Workshop is currently ${workshop.status.toLowerCase()} and not accepting registrations.` };
  }

  // Check if workshop date has passed
  const today = new Date().toISOString().split('T')[0];
  if (workshop.date < today) {
    return { allowed: false, reason: 'This workshop has already taken place.' };
  }

  // Check registration deadline if set
  if (workshop.registrationDeadline && workshop.registrationDeadline < today) {
    return { allowed: false, reason: 'The registration deadline has passed.' };
  }

  // Check duplicate active registration or active reservation
  const now = Date.now();
  const alreadyRegistered = allRegistrations.some(
    (r) =>
      r.workshopId === workshop.id &&
      (r.participantId === participant.id || (participant.email && r.participantEmail === participant.email)) &&
      (r.status === 'CONFIRMED' ||
        r.status === 'ATTENDED' ||
        (r.status === 'PENDING_PAYMENT' && (!r.reservationExpiresAt || new Date(r.reservationExpiresAt).getTime() > now)))
  );

  if (alreadyRegistered) {
    return { allowed: false, reason: 'You are already registered for this workshop.' };
  }

  // Check capacity
  const seats = calculateSeats(workshop, allRegistrations);
  if (seats.isFull) {
    return { allowed: false, reason: 'This workshop has reached maximum capacity.' };
  }

  return { allowed: true };
}

/**
 * Validates whether a registration can be cancelled.
 */
export function canCancel(
  registration: Registration,
  workshop: Workshop | undefined,
  user: User | null
): { allowed: boolean; reason?: string } {
  if (!user) {
    return { allowed: false, reason: 'Authentication required.' };
  }

  if (registration.status === 'CANCELLED') {
    return { allowed: false, reason: 'Registration is already cancelled.' };
  }

  // Participant can only cancel their own registration
  if (registration.participantId !== user.id) {
    return { allowed: false, reason: 'You do not have permission to cancel this registration.' };
  }

  if (workshop && workshop.status === 'COMPLETED') {
    return { allowed: false, reason: 'Cannot cancel registration for a completed workshop.' };
  }

  return { allowed: true };
}

/**
 * Validates workshop form inputs for create / edit.
 */
export function validateWorkshopInput(
  data: Partial<WorkshopFormData>,
  existingConfirmedRegistrations = 0
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  }

  if (!data.summary || data.summary.trim().length < 10) {
    errors.summary = 'Summary must be at least 10 characters.';
  }

  if (!data.description || data.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters.';
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.category = 'Category is required.';
  }

  if (!data.date) {
    errors.date = 'Date is required.';
  }

  if (!data.startTime) {
    errors.startTime = 'Start time is required.';
  }

  if (!data.endTime) {
    errors.endTime = 'End time is required.';
  } else if (data.startTime && data.endTime <= data.startTime) {
    errors.endTime = 'End time must be after start time.';
  }

  if (!data.venue && !data.onlineMode) {
    errors.venue = 'Please specify a physical venue or enable Online Mode.';
  }

  if (!data.capacity || data.capacity <= 0) {
    errors.capacity = 'Capacity must be at least 1.';
  } else if (data.capacity < existingConfirmedRegistrations) {
    errors.capacity = `Cannot reduce capacity to ${data.capacity}. There are already ${existingConfirmedRegistrations} confirmed attendees.`;
  }

  // Registration & Pricing Validation
  if (data.pricingType === 'PAID') {
    if (data.price === undefined || data.price === null || isNaN(Number(data.price)) || Number(data.price) <= 0) {
      errors.price = 'Please specify a valid workshop price greater than ₹0.';
    } else if (Number(data.price) > 100000) {
      errors.price = 'Price exceeds maximum allowed limit of ₹1,00,000.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Checks authorization to edit a workshop.
 */
export function canEditWorkshop(user: User | null, workshop: Workshop): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role === 'ORGANIZER') {
    return user.id === workshop.organizerId;
  }
  return false;
}
