import type { Task } from '../../types';

export function isNewerTask(candidate: Task, current: Task): boolean {
  if (candidate.version !== current.version) {
    return candidate.version > current.version;
  }

  return candidate.updatedAt > current.updatedAt;
}

export function isUnsynced(task: Task): boolean {
  return task.syncStatus === 'pending' || task.syncStatus === 'failed';
}
