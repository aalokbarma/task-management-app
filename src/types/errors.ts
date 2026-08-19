export interface AppError {
  code: string;
  message: string;
  cause?: unknown;
}

export function createAppError(
  code: string,
  message: string,
  cause?: unknown,
): AppError {
  if (cause === undefined) {
    return { code, message };
  }

  return { code, message, cause };
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    typeof value.code === 'string' &&
    typeof value.message === 'string'
  );
}
