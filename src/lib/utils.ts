import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const visitReasonOptions = [
  { value: 'regular_checkup', label: 'Regular Checkup' },
  { value: 'first_meet', label: 'First Meet' },
  { value: 'casual_checkup', label: 'Casual Checkup' },
  { value: 'emergency', label: 'Emergency' },
] as const;

export function getVisitReasonLabel(value: string) {
  return visitReasonOptions.find(option => option.value === value)?.label || value;
}

export function validatePassword(password: string) {
  const requirements = [
    { test: /.{8,}/, message: 'At least 8 characters long' },
    { test: /[A-Z]/, message: 'Contains uppercase letter' },
    { test: /[a-z]/, message: 'Contains lowercase letter' },
    { test: /[0-9]/, message: 'Contains number' },
    { test: /[^A-Za-z0-9]/, message: 'Contains special character' },
  ];

  return requirements.filter(req => !req.test.test(password)).map(req => req.message);
}