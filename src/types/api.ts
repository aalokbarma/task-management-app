import type { AppError } from './errors';

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };
