import type { Task } from '../../types';
import type { TaskObject } from '../schemas/TaskObject';

function isSyncStatus(
  value: string,
): value is Task['syncStatus'] {
  return value === 'synced' || value === 'pending' || value === 'failed';
}

function isSyncOperation(
  value: string,
): value is Task['operation'] {
  return value === 'create' || value === 'update' || value === 'delete';
}

export function mapTask(object: TaskObject): Task {
  if (!isSyncStatus(object.syncStatus) || !isSyncOperation(object.operation)) {
    throw new Error('Stored task has invalid sync metadata.');
  }

  const task: Task = {
    id: object.id,
    userId: object.userId,
    title: object.title,
    completed: object.completed,
    isDeleted: object.isDeleted,
    createdAt: object.createdAt,
    updatedAt: object.updatedAt,
    syncStatus: object.syncStatus,
    operation: object.operation,
    version: object.version,
  };

  if (object.description) {
    task.description = object.description;
  }

  if (object.dueAt) {
    task.dueAt = object.dueAt;
  }

  return task;
}
