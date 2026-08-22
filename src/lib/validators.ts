/**
 * Authentication Form Validation Utilities
 */

// Strict Gmail Regex: Allows standard alphanumeric, dots, plus, hyphen before @gmail.com
export const GMAIL_REGEX = /^[a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*@gmail\.com$/i

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validateFullName(name: string): ValidationResult {
  const trimmed = (name || '').trim()
  if (!trimmed || trimmed.length < 2) {
    return {
      isValid: false,
      error: 'Please enter your full name.',
    }
  }
  return { isValid: true }
}

export function validateGmail(email: string): ValidationResult {
  const normalized = (email || '').trim().toLowerCase()
  if (!normalized || !GMAIL_REGEX.test(normalized)) {
    return {
      isValid: false,
      error: 'Please enter a valid Gmail address.',
    }
  }
  return { isValid: true }
}

export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters.',
    }
  }
  return { isValid: true }
}

export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase()
}
