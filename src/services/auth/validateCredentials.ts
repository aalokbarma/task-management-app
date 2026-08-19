import { createAppError, type AuthCredentials, type Result } from '../../types';
import { AUTH_ERROR_MESSAGES } from './mapAuthError';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function validateCredentials(
  credentials: AuthCredentials,
): Result<AuthCredentials> {
  const email = credentials.email.trim();
  const password = credentials.password;

  if (!email) {
    return {
      success: false,
      error: createAppError(
        'auth/missing-email',
        AUTH_ERROR_MESSAGES['auth/missing-email'],
      ),
    };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return {
      success: false,
      error: createAppError(
        'auth/invalid-email',
        AUTH_ERROR_MESSAGES['auth/invalid-email'],
      ),
    };
  }

  if (!password) {
    return {
      success: false,
      error: createAppError(
        'auth/missing-password',
        AUTH_ERROR_MESSAGES['auth/missing-password'],
      ),
    };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: createAppError(
        'auth/weak-password',
        AUTH_ERROR_MESSAGES['auth/weak-password'],
      ),
    };
  }

  return { success: true, data: { email, password } };
}
