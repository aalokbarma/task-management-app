import { createAppError, isAppError, type AppError } from '../../types';

export const DEFAULT_AUTH_ERROR_MESSAGE =
  'Something went wrong. Please try again.';

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/missing-email': 'Enter an email address.',
  'auth/missing-password': 'Enter a password.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'Invalid email or password.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/invalid-login-credentials': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
  'auth/network-request-failed':
    'Network error. Check your connection and try again.',
  'auth/operation-not-allowed': 'Email sign-in is not enabled for this app.',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFirebaseAuthError(error: unknown): error is { code: string } {
  return isRecord(error) && typeof error.code === 'string';
}

export function mapAuthError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (isFirebaseAuthError(error)) {
    return createAppError(
      error.code,
      AUTH_ERROR_MESSAGES[error.code] ?? DEFAULT_AUTH_ERROR_MESSAGE,
      error,
    );
  }

  return createAppError(
    'auth/unknown',
    DEFAULT_AUTH_ERROR_MESSAGE,
    error,
  );
}
