import { createAppError, type CreateTaskInput, type Result, type UpdateTaskInput } from '../../types';

export const TASK_ERROR_MESSAGES = {
  'task/invalid-title': 'Enter a task title.',
  'task/invalid-due-date': 'Enter a valid due date.',
  'task/empty-update': 'No task changes were provided.',
  'task/not-found': 'That task could not be found.',
  'task/database-closed':
    'The local database is not open. Open it after the user signs in.',
  'task/write-failed': 'Could not save the task locally.',
} as const;

function parseDueAt(value: string | undefined): Result<string | undefined> {
  if (value === undefined) {
    return { success: true, data: undefined };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { success: true, data: undefined };
  }

  const timestamp = Date.parse(trimmed);
  if (Number.isNaN(timestamp)) {
    return {
      success: false,
      error: createAppError(
        'task/invalid-due-date',
        TASK_ERROR_MESSAGES['task/invalid-due-date'],
      ),
    };
  }

  return { success: true, data: new Date(timestamp).toISOString() };
}

export function validateCreateTaskInput(
  input: CreateTaskInput,
): Result<CreateTaskInput> {
  const title = input.title.trim();
  if (!title) {
    return {
      success: false,
      error: createAppError(
        'task/invalid-title',
        TASK_ERROR_MESSAGES['task/invalid-title'],
      ),
    };
  }

  const dueAt = parseDueAt(input.dueAt);
  if (!dueAt.success) {
    return dueAt;
  }

  const description = input.description?.trim();
  const data: CreateTaskInput = { title };

  if (description) {
    data.description = description;
  }

  if (dueAt.data) {
    data.dueAt = dueAt.data;
  }

  return { success: true, data };
}

export function validateUpdateTaskInput(
  input: UpdateTaskInput,
): Result<UpdateTaskInput> {
  if (
    input.title === undefined &&
    input.description === undefined &&
    input.dueAt === undefined &&
    input.completed === undefined
  ) {
    return {
      success: false,
      error: createAppError(
        'task/empty-update',
        TASK_ERROR_MESSAGES['task/empty-update'],
      ),
    };
  }

  const data: UpdateTaskInput = {};

  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) {
      return {
        success: false,
        error: createAppError(
          'task/invalid-title',
          TASK_ERROR_MESSAGES['task/invalid-title'],
        ),
      };
    }
    data.title = title;
  }

  if (input.description !== undefined) {
    data.description = input.description.trim();
  }

  if (input.dueAt !== undefined) {
    const dueAt = parseDueAt(input.dueAt);
    if (!dueAt.success) {
      return dueAt;
    }
    data.dueAt = dueAt.data ?? '';
  }

  if (input.completed !== undefined) {
    data.completed = input.completed;
  }

  return { success: true, data };
}
