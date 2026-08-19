import type { Task } from '../../types';

// Decides which copy of a task should win when comparing local vs remote.
// Version number is the main signal (it goes up on every edit); if both
// sides somehow have the same version we fall back to whichever was
// updated more recently.
export function isNewerTask(candidate: Task, current: Task): boolean {
  if (candidate.version !== current.version) {
    return candidate.version > current.version;
  }

  return candidate.updatedAt > current.updatedAt;
}

// A task is "unsynced" when it has local changes that Firestore doesn't
// know about yet (a new edit, or a previous sync attempt that failed).
export function isUnsynced(task: Task): boolean {
  return task.syncStatus === 'pending' || task.syncStatus === 'failed';
}
