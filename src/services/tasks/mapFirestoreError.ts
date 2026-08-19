import { createAppError, isAppError, type AppError } from '../../types';

export const DEFAULT_FIRESTORE_ERROR_MESSAGE =
  'Could not reach the remote task service. Please try again.';

export const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  'firestore/permission-denied':
    'You do not have permission to sync these tasks.',
  'firestore/unauthenticated': 'Sign in to sync your tasks.',
  'firestore/unavailable':
    'The remote task service is temporarily unavailable.',
  'firestore/network-request-failed':
    'Network error. Check your connection and try again.',
  'firestore/not-found': 'That remote task could not be found.',
  'firestore/invalid-argument': 'The remote task data is invalid.',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFirebaseError(error: unknown): error is { code: string } {
  return isRecord(error) && typeof error.code === 'string';
}

function normalizeFirestoreCode(code: string): string {
  if (code.startsWith('firestore/')) {
    return code;
  }

  return `firestore/${code}`;
}

export function mapFirestoreError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (isFirebaseError(error)) {
    const code = normalizeFirestoreCode(error.code);
    return createAppError(
      code,
      FIRESTORE_ERROR_MESSAGES[code] ?? DEFAULT_FIRESTORE_ERROR_MESSAGE,
      error,
    );
  }

  return createAppError(
    'firestore/unknown',
    DEFAULT_FIRESTORE_ERROR_MESSAGE,
    error,
  );
}
