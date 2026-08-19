import type { AppError } from '../../types';

const EMAIL_CODES = new Set(['auth/missing-email', 'auth/invalid-email']);
const PASSWORD_CODES = new Set([
  'auth/missing-password',
  'auth/weak-password',
]);

export interface CredentialFieldErrors {
  email?: string;
  password?: string;
}

export function mapCredentialFieldErrors(
  error: AppError,
): CredentialFieldErrors {
  if (EMAIL_CODES.has(error.code)) {
    return { email: error.message };
  }

  if (PASSWORD_CODES.has(error.code)) {
    return { password: error.message };
  }

  return {};
}

export function isCredentialFieldError(error: AppError): boolean {
  return EMAIL_CODES.has(error.code) || PASSWORD_CODES.has(error.code);
}
