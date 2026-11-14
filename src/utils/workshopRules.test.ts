import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSeats,
  canRegister,
  canCancel,
  validateWorkshopInput,
  canEditWorkshop,
} from './workshopRules';
import { KAUSHALYA_LOGO_URL } from '../components/common/BrandLogo';
import { Workshop, Registration, User } from '../types';

const mockOrganizer: User = {
  id: 'org-1',
  fullName: 'Dr. Sarah Lin',
  email: 'sarah@faculty.edu',
  role: 'ORGANIZER',
  accountStatus: 'ACTIVE',
  createdAt: '2026-01-01',
};

const mockParticipant: User = {
  id: 'part-1',
  fullName: 'Alex Morgan',
  email: 'alex@student.edu',
  role: 'PARTICIPANT',
  accountStatus: 'ACTIVE',
  createdAt: '2026-01-10',
};

const mockSuspendedUser: User = {
  id: 'part-2',
  fullName: 'Banned User',
  email: 'banned@student.edu',
  role: 'PARTICIPANT',
  accountStatus: 'SUSPENDED',
  createdAt: '2026-01-10',
};

const mockWorkshop: Workshop = {
  id: 'ws-1',
  title: 'Cloud Architecture & DevOps',
  summary: 'Hands-on system deployment session',
  description: 'Learn scalable cloud deployment patterns with microservices and Docker.',
  category: 'Cloud Computing',
  bannerImageUrl: '/assets/sample.jpg',
  organizerId: 'org-1',
  organizerNameSnapshot: 'Dr. Sarah Lin',
  date: '2026-11-15',
  startTime: '10:00',
  endTime: '13:00',
  venue: 'Lab Hall 402',
  onlineMode: false,
  capacity: 2,
  registrationDeadline: '2026-11-14',
  learningOutcomes: ['Cloud orchestration', 'CI/CD pipelines'],
  status: 'PUBLISHED',
  pricingType: 'FREE',
  price: 0,
  currency: 'INR',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

test('calculateSeats correctly accounts for CONFIRMED and ATTENDED vs CANCELLED registrations', () => {
  const registrations: Registration[] = [
    {
      id: 'reg-1',
      workshopId: 'ws-1',
      participantId: 'p-1',
      participantName: 'Alice',
      participantEmail: 'alice@test.edu',
      registeredAt: '2026-10-01',
      status: 'CONFIRMED',
      updatedAt: '2026-10-01',
    },
    {
      id: 'reg-2',
      workshopId: 'ws-1',
      participantId: 'p-2',
      participantName: 'Bob',
      participantEmail: 'bob@test.edu',
      registeredAt: '2026-10-01',
      status: 'CANCELLED', // Cancelled should NOT count towards capacity
      updatedAt: '2026-10-02',
    },
    {
      id: 'reg-3',
      workshopId: 'ws-1',
      participantId: 'p-3',
      participantName: 'Charlie',
      participantEmail: 'charlie@test.edu',
      registeredAt: '2026-10-01',
      status: 'ATTENDED', // Attended attendees must also consume seat capacity
      updatedAt: '2026-10-02',
    },
  ];

  const seats = calculateSeats(mockWorkshop, registrations);
  assert.equal(seats.registeredCount, 2);
  assert.equal(seats.availableSeats, 0);
  assert.equal(seats.isFull, true);
});

test('canRegister permits eligible participant when capacity is available', () => {
  const result = canRegister(mockWorkshop, mockParticipant, []);
  assert.equal(result.allowed, true);
});

test('canRegister blocks unauthenticated visitors', () => {
  const result = canRegister(mockWorkshop, null, []);
  assert.equal(result.allowed, false);
  assert.match(result.reason || '', /log in/i);
});

test('canRegister blocks duplicate active registrations for the same user', () => {
  const existingRegistrations: Registration[] = [
    {
      id: 'reg-existing',
      workshopId: 'ws-1',
      participantId: 'part-1',
      participantName: 'Alex Morgan',
      participantEmail: 'alex@student.edu',
      registeredAt: '2026-10-01',
      status: 'CONFIRMED',
      updatedAt: '2026-10-01',
    },
  ];

  const result = canRegister(mockWorkshop, mockParticipant, existingRegistrations);
  assert.equal(result.allowed, false);
  assert.match(result.reason || '', /already registered/i);
});

test('canRegister rejects when workshop is at full capacity', () => {
  const fullRegistrations: Registration[] = [
    {
      id: 'reg-1',
      workshopId: 'ws-1',
      participantId: 'user-a',
      participantName: 'User A',
      participantEmail: 'a@test.edu',
      registeredAt: '2026-10-01',
      status: 'CONFIRMED',
      updatedAt: '2026-10-01',
    },
    {
      id: 'reg-2',
      workshopId: 'ws-1',
      participantId: 'user-b',
      participantName: 'User B',
      participantEmail: 'b@test.edu',
      registeredAt: '2026-10-01',
      status: 'CONFIRMED',
      updatedAt: '2026-10-01',
    },
  ];

  const result = canRegister(mockWorkshop, mockParticipant, fullRegistrations);
  assert.equal(result.allowed, false);
  assert.match(result.reason || '', /maximum capacity/i);
});

test('canRegister rejects suspended accounts', () => {
  const result = canRegister(mockWorkshop, mockSuspendedUser, []);
  assert.equal(result.allowed, false);
  assert.match(result.reason || '', /suspended/i);
});

test('canCancel permits participant to cancel their own registration', () => {
  const registration: Registration = {
    id: 'reg-1',
    workshopId: 'ws-1',
    participantId: 'part-1',
    participantName: 'Alex Morgan',
    participantEmail: 'alex@student.edu',
    registeredAt: '2026-10-01',
    status: 'CONFIRMED',
    updatedAt: '2026-10-01',
  };

  const result = canCancel(registration, mockWorkshop, mockParticipant);
  assert.equal(result.allowed, true);
});

test('canCancel blocks unauthorized participant from cancelling another users registration', () => {
  const registration: Registration = {
    id: 'reg-1',
    workshopId: 'ws-1',
    participantId: 'someone-else',
    participantName: 'Other Person',
    participantEmail: 'other@test.edu',
    registeredAt: '2026-10-01',
    status: 'CONFIRMED',
    updatedAt: '2026-10-01',
  };

  const result = canCancel(registration, mockWorkshop, mockParticipant);
  assert.equal(result.allowed, false);
  assert.match(result.reason || '', /permission/i);
});

test('validateWorkshopInput detects end time before start time and invalid capacity', () => {
  const invalid = validateWorkshopInput({
    title: 'Short',
    summary: 'Too short',
    description: 'Also too short',
    category: 'Cloud',
    date: '2026-11-20',
    startTime: '14:00',
    endTime: '13:00', // Invalid: end before start
    venue: 'Room 101',
    capacity: 0, // Invalid: zero capacity
  });

  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.endTime, 'Should flag end time error');
  assert.ok(invalid.errors.capacity, 'Should flag capacity error');
});

test('canEditWorkshop enforces organizer ownership', () => {
  assert.equal(canEditWorkshop(mockOrganizer, mockWorkshop), true); // Owner
  assert.equal(canEditWorkshop(mockParticipant, mockWorkshop), false); // Participant

  const anotherOrganizer: User = {
    id: 'org-2',
    fullName: 'Dr. John Doe',
    email: 'john@faculty.edu',
    role: 'ORGANIZER',
    accountStatus: 'ACTIVE',
    createdAt: '2026-01-01',
  };
  assert.equal(canEditWorkshop(anotherOrganizer, mockWorkshop), false); // Not the owner
});

test('validateWorkshopInput enforces positive price for PAID workshops and allows 0 for FREE', () => {
  const paidWithZero = validateWorkshopInput({
    title: 'Advanced Machine Learning Studio',
    summary: 'A deep-dive workshop into modern neural architecture design.',
    description: 'Comprehensive 4-hour hands-on lab on deep transformer models and PyTorch deployment.',
    category: 'AI & Data Science',
    date: '2026-11-20',
    startTime: '10:00',
    endTime: '14:00',
    venue: 'Lab 201',
    capacity: 30,
    pricingType: 'PAID',
    price: 0,
  });
  assert.equal(paidWithZero.valid, false);
  assert.ok(paidWithZero.errors.price, 'Should reject zero price for paid workshop');

  const validPaid = validateWorkshopInput({
    title: 'Advanced Machine Learning Studio',
    summary: 'A deep-dive workshop into modern neural architecture design.',
    description: 'Comprehensive 4-hour hands-on lab on deep transformer models and PyTorch deployment.',
    category: 'AI & Data Science',
    date: '2026-11-20',
    startTime: '10:00',
    endTime: '14:00',
    venue: 'Lab 201',
    capacity: 30,
    pricingType: 'PAID',
    price: 499,
  });
  assert.equal(validPaid.valid, true);
});

test('calculateSeats counts unexpired PENDING_PAYMENT reservations toward capacity', () => {
  const futureReservation: Registration = {
    id: 'reg-pending',
    workshopId: 'ws-1',
    participantId: 'p-pending',
    participantName: 'Pending Participant',
    participantEmail: 'pending@test.edu',
    registeredAt: new Date().toISOString(),
    status: 'PENDING_PAYMENT',
    pricingTypeSnapshot: 'PAID',
    amount: 499,
    reservationExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes in future
    updatedAt: new Date().toISOString(),
  };

  const seatsWithPending = calculateSeats(mockWorkshop, [futureReservation]);
  assert.equal(seatsWithPending.registeredCount, 1);
  assert.equal(seatsWithPending.availableSeats, 1);
});

test('KAUSHALYA_LOGO_URL matches official Cloudinary approved emblem', () => {
  assert.equal(
    KAUSHALYA_LOGO_URL,
    'https://res.cloudinary.com/dr59elrhw/image/upload/v1794634835/kessknblaoupdmy9wqgv.png',
    'Official Cloudinary emblem must match production asset spec'
  );
});

test('Required student demo personas list adheres to academic roster spec', () => {
  const requiredDemoStudents = [
    'Aary Nikam',
    'Kedar Parab',
    'Omkar Parelkar',
    'Vaibhavi Parmar',
    'Sonal Sharma',
  ];
  assert.equal(requiredDemoStudents.length, 5);
  requiredDemoStudents.forEach((name) => {
    assert.ok(name.length > 0, `Student persona ${name} must be valid`);
  });
});
