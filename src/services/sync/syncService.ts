import { AppState, type AppStateStatus } from 'react-native';
import { store } from '../../app/store';
import {
  applyRemoteSnapshot,
  getTaskForSync,
  listAllTasksForSync,
  listPendingSyncTasks,
  markTaskFailed,
  markTaskSynced,
  removeLocalIfSynced,
} from '../../database/taskRepository';
import { getOpenedRealmUserId } from '../../database/realm';
import type { Result, Task } from '../../types';
import { logger } from '../../utils/logger';
import {
  deleteRemoteTask,
  getRemoteTask,
  listRemoteTasks,
  upsertRemoteTask,
} from '../tasks';
import { isNewerTask, isUnsynced } from './compareTasks';

let started = false;
let unsubscribeStore: (() => void) | null = null;
let appStateSubscription: { remove: () => void } | null = null;
let inFlight: Promise<void> | null = null;
let queued = false;
let wasOnline = false;
let wasAuthenticated = false;

function canSync(): boolean {
  const state = store.getState();
  return (
    state.connectivity.isOnline && state.auth.status === 'authenticated'
  );
}

function logResult<T>(result: Result<T>, context: string): boolean {
  if (result.success) {
    return true;
  }

  logger.error(result.error, context);
  return false;
}

async function pullAndMergeRemoteTasks(): Promise<void> {
  const userId = getOpenedRealmUserId();
  if (!userId) {
    return;
  }

  const remoteResult = await listRemoteTasks(userId);
  if (!remoteResult.success) {
    logger.error(remoteResult.error, 'sync.pull');
    return;
  }

  const localResult = listAllTasksForSync();
  if (!localResult.success) {
    logger.error(localResult.error, 'sync.listLocal');
    return;
  }

  const localById = new Map(
    localResult.data.map(task => [task.id, task]),
  );
  const remoteIds = new Set(remoteResult.data.map(task => task.id));

  for (const remoteTask of remoteResult.data) {
    const localTask = localById.get(remoteTask.id);
    if (!localTask) {
      logResult(applyRemoteSnapshot(remoteTask), 'sync.applyRemote');
      continue;
    }

    if (isUnsynced(localTask)) {
      continue;
    }

    if (isNewerTask(remoteTask, localTask)) {
      logResult(applyRemoteSnapshot(remoteTask), 'sync.applyNewerRemote');
    }
  }

  for (const localTask of localResult.data) {
    if (remoteIds.has(localTask.id) || isUnsynced(localTask)) {
      continue;
    }

    logResult(removeLocalIfSynced(localTask.id), 'sync.removeRemoteDeleted');
  }
}

async function pushTask(task: Task): Promise<void> {
  if (task.operation === 'delete') {
    const remoteResult = await deleteRemoteTask(task.userId, task.id);
    const latest = getTaskForSync(task.id);
    if (!latest.success) {
      logger.error(latest.error, 'sync.reRead');
      return;
    }

    if (
      !isUnsynced(latest.data) ||
      latest.data.version !== task.version
    ) {
      return;
    }

    if (remoteResult.success) {
      logResult(markTaskSynced(task.id), 'sync.markSynced');
      return;
    }

    logger.error(remoteResult.error, 'sync.pushDelete');
    logResult(markTaskFailed(task.id), 'sync.markFailed');
    return;
  }

  const remoteLookup = await getRemoteTask(task.userId, task.id);
  if (!remoteLookup.success) {
    logger.error(remoteLookup.error, 'sync.getRemote');
    const latest = getTaskForSync(task.id);
    if (
      latest.success &&
      isUnsynced(latest.data) &&
      latest.data.version === task.version
    ) {
      logResult(markTaskFailed(task.id), 'sync.markFailed');
    }
    return;
  }

  if (remoteLookup.data && isNewerTask(remoteLookup.data, task)) {
    const latest = getTaskForSync(task.id);
    if (
      latest.success &&
      isUnsynced(latest.data) &&
      latest.data.version === task.version
    ) {
      logResult(
        applyRemoteSnapshot(remoteLookup.data),
        'sync.lastWriteWinsRemote',
      );
    }
    return;
  }

  const remoteResult = await upsertRemoteTask(task);
  const latest = getTaskForSync(task.id);
  if (!latest.success) {
    logger.error(latest.error, 'sync.reRead');
    return;
  }

  if (!isUnsynced(latest.data) || latest.data.version !== task.version) {
    return;
  }

  if (remoteResult.success) {
    logResult(markTaskSynced(task.id), 'sync.markSynced');
    return;
  }

  logger.error(remoteResult.error, 'sync.push');
  logResult(markTaskFailed(task.id), 'sync.markFailed');
}

async function syncOutgoingTask(taskId: string): Promise<void> {
  const current = getTaskForSync(taskId);
  if (!current.success) {
    logger.error(current.error, 'sync.read');
    return;
  }

  if (!isUnsynced(current.data)) {
    return;
  }

  await pushTask(current.data);
}

async function processOutgoingTasks(): Promise<void> {
  const pending = listPendingSyncTasks();
  if (!pending.success) {
    logger.error(pending.error, 'sync.listPending');
    return;
  }

  const seen = new Set<string>();

  for (const task of pending.data) {
    if (!isUnsynced(task) || seen.has(task.id)) {
      continue;
    }

    seen.add(task.id);
    await syncOutgoingTask(task.id);
  }
}

async function processSync(): Promise<void> {
  await pullAndMergeRemoteTasks();
  await processOutgoingTasks();
}

async function runSync(): Promise<void> {
  if (!canSync()) {
    return;
  }

  if (inFlight) {
    queued = true;
    return;
  }

  inFlight = processSync();
  try {
    await inFlight;
  } catch (error) {
    logger.error(error, 'sync.run');
  } finally {
    inFlight = null;
    if (queued) {
      queued = false;
      await runSync();
    }
  }
}

export function requestSync(): void {
  runSync().catch(error => {
    logger.error(error, 'sync.request');
  });
}

function onStoreChange(): void {
  const state = store.getState();
  const isOnline = state.connectivity.isOnline;
  const isAuthenticated = state.auth.status === 'authenticated';
  const cameOnline = isOnline && !wasOnline;
  const signedIn = isAuthenticated && !wasAuthenticated;

  wasOnline = isOnline;
  wasAuthenticated = isAuthenticated;

  if (isOnline && isAuthenticated && (cameOnline || signedIn)) {
    requestSync();
  }
}

function onAppStateChange(nextState: AppStateStatus): void {
  if (nextState === 'active') {
    requestSync();
  }
}

export function startSyncService(): void {
  if (started) {
    return;
  }

  started = true;
  const state = store.getState();
  wasOnline = state.connectivity.isOnline;
  wasAuthenticated = state.auth.status === 'authenticated';

  unsubscribeStore = store.subscribe(onStoreChange);
  appStateSubscription = AppState.addEventListener(
    'change',
    onAppStateChange,
  );
  requestSync();
}

export function stopSyncService(): void {
  if (!started) {
    return;
  }

  unsubscribeStore?.();
  unsubscribeStore = null;
  appStateSubscription?.remove();
  appStateSubscription = null;
  started = false;
  queued = false;
}
