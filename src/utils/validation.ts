// Validation utilities

import { Config } from '../constants/config';

export function validatePhone(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return 'Please enter your mobile number.';
  if (cleaned.length < 10) return 'Please enter a valid 10-digit mobile number.';
  return null;
}

export function validateOtp(otp: string): string | null {
  if (!otp) return 'Please enter the OTP.';
  if (otp.length !== 6) return 'Please enter all 6 digits.';
  if (!/^\d{6}$/.test(otp)) return 'OTP must contain only numbers.';
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Please enter your name.';
  if (name.trim().length < 2) return 'Name must be at least 2 characters.';
  return null;
}

export function validateAge(age: string | number): string | null {
  const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;
  if (isNaN(ageNum)) return 'Please enter your age.';
  if (ageNum < Config.MIN_AGE) return `You must be at least ${Config.MIN_AGE} years old to join.`;
  if (ageNum > 110) return 'Please enter a valid age.';
  return null;
}

export function validateCity(city: string): string | null {
  if (!city.trim()) return 'Please enter your city.';
  return null;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}
