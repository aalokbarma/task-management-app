import type { AppError } from '../../types';

export interface TaskFieldErrors {
  title?: string;
  dueAt?: string;
}

export function mapTaskFieldErrors(error: AppError): TaskFieldErrors {
  if (error.code === 'task/invalid-title') {
    return { title: error.message };
  }

  if (error.code === 'task/invalid-due-date') {
    return { dueAt: error.message };
  }

  return {};
}
