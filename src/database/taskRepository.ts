import Realm from 'realm';
import {
  validateCreateTaskInput,
  validateUpdateTaskInput,
  TASK_ERROR_MESSAGES,
} from '../features/tasks/validateTask';
import {
  createAppError,
  isAppError,
  type CreateTaskInput,
  type Result,
  type SyncOperation,
  type Task,
  type UpdateTaskInput,
} from '../types';
import { createId } from '../utils/createId';
import { logger } from '../utils/logger';
import { mapTask } from './mappers/taskMapper';
import { getOpenedRealmUserId, getRealm } from './realm';
import { TaskObject } from './schemas/TaskObject';

function nowIso(): string {
  return new Date().toISOString();
}

function databaseClosedError(): Result<never> {
  return {
    success: false,
    error: createAppError(
      'task/database-closed',
      TASK_ERROR_MESSAGES['task/database-closed'],
    ),
  };
}

function notFoundError(): Result<never> {
  return {
    success: false,
    error: createAppError(
      'task/not-found',
      TASK_ERROR_MESSAGES['task/not-found'],
    ),
  };
}

function requireUserId(): Result<string> {
  const userId = getOpenedRealmUserId();
  if (!userId) {
    return databaseClosedError();
  }

  return { success: true, data: userId };
}

function toWriteError(error: unknown): Result<never> {
  if (isAppError(error)) {
    return { success: false, error };
  }

  logger.error(error, 'taskRepository');

  if (
    error instanceof Error &&
    error.message.includes('local database is not open')
  ) {
    return databaseClosedError();
  }

  return {
    success: false,
    error: createAppError(
      'task/write-failed',
      TASK_ERROR_MESSAGES['task/write-failed'],
      error,
    ),
  };
}

function findOwnedTask(
  realm: Realm,
  userId: string,
  taskId: string,
): TaskObject | null {
  const object = realm.objectForPrimaryKey(TaskObject, taskId);
  if (!object || object.userId !== userId) {
    return null;
  }

  return object;
}

function nextMutationOperation(object: TaskObject): SyncOperation {
  if (object.operation === 'create' && object.syncStatus !== 'synced') {
    return 'create';
  }

  return 'update';
}

function queryVisibleTasks(
  realm: Realm,
  userId: string,
): Realm.Results<TaskObject> {
  return realm
    .objects(TaskObject)
    .filtered('userId == $0 AND isDeleted == false', userId)
    .sorted('createdAt', true);
}

export function listTasks(): Result<Task[]> {
  const userIdResult = requireUserId();
  if (!userIdResult.success) {
    return userIdResult;
  }

  try {
    const results = queryVisibleTasks(getRealm(), userIdResult.data);
    return { success: true, data: Array.from(results, mapTask) };
  } catch (error) {
    return toWriteError(error);
  }
}

export function subscribeToTasks(
  listener: (result: Result<Task[]>) => void,
): () => void {
  const userIdResult = requireUserId();
  if (!userIdResult.success) {
    listener(userIdResult);
    return () => {};
  }

  try {
    const results = queryVisibleTasks(getRealm(), userIdResult.data);

    const emit = (): void => {
      listener({ success: true, data: Array.from(results, mapTask) });
    };

    results.addListener(emit);
    emit();
    return () => {
      try {
        results.removeAllListeners();
      } catch (error) {
        logger.error(error, 'task.subscribe.unsubscribe');
      }
    };
  } catch (error) {
    listener(toWriteError(error));
    return () => {};
  }
}

export function getTask(taskId: string): Result<Task> {
  const userIdResult = requireUserId();
  if (!userIdResult.success) {
    return userIdResult;
  }

  try {
    const object = findOwnedTask(getRealm(), userIdResult.data, taskId);
    if (!object || object.isDeleted) {
      return notFoundError();
    }

    return { success: true, data: mapTask(object) };
  } catch (error) {
    return toWriteError(error);
  }
}

export function getTaskForSync(taskId: string): Result<Task> {
  const userIdResult = requireUserId();
  if (!userIdResult.success) {
    return userIdResult;
  }

  try {
    const object = findOwnedTask(getRealm(), userIdResult.data, taskId);
    if (!object) {
      return notFoundError();
    }

    return { success: true, data: mapTask(object) };
  } catch (error) {
    return toWriteError(error);
  }
}

export function createTask(input: CreateTaskInput): Result<Task> {
  const userIdResult = requireUserId();
  if (!userIdResult.success) {
    return userIdResult;
  }

  const validation = validateCreateTaskInput(input);
  if (!validation.success) {
    return validation;
  }

  try {
    const realm = getRealm();
    const id = createId();
    const timestamp = nowIso();

    realm.write(() => {
      realm.create(TaskObject, {
        id,
        userId: userIdResult.data,
        title: validation.data.title,
        description: validation.data.description ?? null,
        dueAt: validation.data.dueAt ?? null,
        completed: false,
        isDeleted: false,
        createdAt: timestamp,
        updatedAt: timestamp,
        syncStatus: 'pending',
        operation: 'create',
        version: 1,
      });
    });

    const created = findOwnedTask(realm, userIdResult.data, id);
    if (!created) {
      return toWriteError(new Error('Task was not created.'));
    }

    return { success: true, data: mapTask(created) };
  } catch (error) {
    return toWriteError(error);
  }
}

export function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Result<Task> {
  const userIdResult = requireUserId();
  if (!userIdResult.success) {
    return userIdResult;
  }

  const validation = validateUpdateTaskInput(input);
  if (!validation.success) {
    return validation;
  }

  try {
    const realm = getRealm();
    const object = findOwnedTask(realm, userIdResult.data, taskId);
    if (!object || object.isDeleted) {
      return notFoundError();
    }

    realm.write(() => {
      if (validation.data.title !== undefined) {
        object.title = validation.data.title;
      }

      if (validation.data.description !== undefined) {
        object.description = validation.data.description || null;
      }

      if (validation.data.dueAt !== undefined) {
        object.dueAt = validation.data.dueAt || null;
      }

      if (validation.data.completed !== undefined) {
        object.completed = validation.data.completed;
      }

      const operation = nextMutationOperation(object);
      object.updatedAt = nowIso();
      object.syncStatus = 'pending';
      object.operation = operation;
      object.version += 1;
    });

    return { success: true, data: mapTask(object) };
  } catch (error) {
    return toWriteError(error);
  }
}

export function setTaskCompleted(
  taskId: string,
  completed: boolean,
): Result<Task> {
  return updateTask(taskId, { completed });
}

export function deleteTask(taskId: string): Result<void> {
  const userIdResult = requireUserId();
  if (!userIdResult.success) {
    return userIdResult;
  }

  try {
    const realm = getRealm();
    const object = findOwnedTask(realm, userIdResult.data, taskId);
    if (!object) {
      return notFoundError();
    }

    if (object.isDeleted) {
      return { success: true, data: undefined };
    }

    realm.write(() => {
      if (object.operation === 'create' && object.syncStatus !== 'synced') {
        realm.delete(object);
        return;
      }

      object.isDeleted = true;
      object.updatedAt = nowIso();
      object.syncStatus = 'pending';
      object.operation = 'delete';
      object.version += 1;
    });

    return { success: true, data: undefined };
  } catch (error) {
    return toWriteError(error);
  }
}

export function listPendingSyncTasks(): Result<Task[]> {
  const userIdResult = requireUserId();
  if (!userIdResult.success) {
    return userIdResult;
  }

  try {
    const results = getRealm()
      .objects(TaskObject)
      .filtered(
        'userId == $0 AND syncStatus != $1',
        userIdResult.data,
        'synced',
      )
      .sorted('updatedAt', false);

    return { success: true, data: Array.from(results, mapTask) };
  } catch (error) {
    return toWriteError(error);
  }
}

export function markTaskSynced(taskId: string): Result<void> {
  const userIdResult = requireUserId();
  if (!userIdResult.success) {
    return userIdResult;
  }

  try {
    const realm = getRealm();
    const object = findOwnedTask(realm, userIdResult.data, taskId);
    if (!object) {
      return notFoundError();
    }

    realm.write(() => {
      if (object.operation === 'delete') {
        realm.delete(object);
        return;
      }

      object.syncStatus = 'synced';
    });

    return { success: true, data: undefined };
  } catch (error) {
    return toWriteError(error);
  }
}

export function markTaskFailed(taskId: string): Result<void> {
  const userIdResult = requireUserId();
  if (!userIdResult.success) {
    return userIdResult;
  }

  try {
    const realm = getRealm();
    const object = findOwnedTask(realm, userIdResult.data, taskId);
    if (!object) {
      return notFoundError();
    }

    realm.write(() => {
      object.syncStatus = 'failed';
    });

    return { success: true, data: undefined };
  } catch (error) {
    return toWriteError(error);
  }
}
