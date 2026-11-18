/**
 * Validation utilities for Kaushalya
 * Enforces strict authentication, phone number, password, and form validation rules.
 */

/**
 * Validates standard Indian mobile phone numbers:
 * - Exactly 10 digits
 * - Starts with 6, 7, 8, or 9
 * - Numeric characters only (gracefully handles +91, 91, 0 prefixes, spaces, and hyphens)
 */
export function validateIndianPhone(input: string): { isValid: boolean; error?: string; cleanPhone?: string } {
  if (!input || !input.trim()) {
    return { isValid: false, error: 'Phone number is required.' };
  }

  const trimmed = input.trim();

  // Check for any alphabetical characters
  if (/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: 'Phone number cannot contain letters.' };
  }

  // Remove valid international prefix, spaces, dashes, parens
  let digitsOnly = trimmed.replace(/\D/g, '');

  // Strip country code +91 or 91 (12 digits)
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    digitsOnly = digitsOnly.substring(2);
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    // Strip leading 0 (11 digits)
    digitsOnly = digitsOnly.substring(1);
  }

  if (digitsOnly.length < 10) {
    return { isValid: false, error: `Phone number is too short (${digitsOnly.length}/10 digits). Please enter 10 digits.` };
  }

  if (digitsOnly.length > 10) {
    return { isValid: false, error: `Phone number is too long (${digitsOnly.length} digits). Please enter 10 digits.` };
  }

  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(digitsOnly)) {
    return { isValid: false, error: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.' };
  }

  return { isValid: true, cleanPhone: digitsOnly };
}

/**
 * Validates password complexity:
 * - Minimum 6 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one numeric digit (0-9)
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Password must be at least 6 characters and include one uppercase letter, one lowercase letter and one number.',
    };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasDigit) {
    return {
      isValid: false,
      error: 'Password must be at least 6 characters and include one uppercase letter, one lowercase letter and one number.',
    };
  }

  return { isValid: true };
}

export type PasswordStrengthLevel = 'Weak' | 'Medium' | 'Strong';

export interface PasswordStrengthResult {
  score: number; // 0 to 3
  label: PasswordStrengthLevel;
  percent: number; // 0 to 100
  color: string;
}

/**
 * Computes dynamic password strength indicator without interfering with validation
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { score: 0, label: 'Weak', percent: 0, color: '#101D32' };
  }

  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) score++;
  if (password.length >= 8 && /[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return { score: 1, label: 'Weak', percent: 33, color: '#E84316' };
  }
  if (score === 2) {
    return { score: 2, label: 'Medium', percent: 66, color: '#F4511E' };
  }
  return { score: 3, label: 'Strong', percent: 100, color: '#101D32' };
}

/**
 * Validates full name:
 * - At least 2 characters
 * - Cannot be whitespace only
 */
export function validateFullName(name: string): { isValid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Full name is required.' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters.' };
  }
  return { isValid: true };
}

/**
 * Validates email format with standard pattern
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true };
}
