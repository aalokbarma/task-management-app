import { AppState, type AppStateStatus } from 'react-native';
import { store } from '../../app/store';
import {
  getTaskForSync,
  listPendingSyncTasks,
  markTaskFailed,
  markTaskSynced,
} from '../../database/taskRepository';
import { logger } from '../../utils/logger';
import { deleteRemoteTask, upsertRemoteTask } from '../tasks';

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

async function syncTask(taskId: string): Promise<void> {
  const current = getTaskForSync(taskId);
  if (!current.success) {
    logger.error(current.error, 'sync.read');
    return;
  }

  const task = current.data;
  if (task.syncStatus !== 'pending') {
    return;
  }

  const versionAtStart = task.version;
  const remoteResult =
    task.operation === 'delete'
      ? await deleteRemoteTask(task.userId, task.id)
      : await upsertRemoteTask(task);

  const latest = getTaskForSync(taskId);
  if (!latest.success) {
    logger.error(latest.error, 'sync.reRead');
    return;
  }

  if (
    latest.data.syncStatus !== 'pending' ||
    latest.data.version !== versionAtStart
  ) {
    return;
  }

  if (remoteResult.success) {
    const marked = markTaskSynced(taskId);
    if (!marked.success) {
      logger.error(marked.error, 'sync.markSynced');
    }
    return;
  }

  logger.error(remoteResult.error, 'sync.push');
  const markedFailed = markTaskFailed(taskId);
  if (!markedFailed.success) {
    logger.error(markedFailed.error, 'sync.markFailed');
  }
}

async function processPendingTasks(): Promise<void> {
  const pending = listPendingSyncTasks();
  if (!pending.success) {
    logger.error(pending.error, 'sync.listPending');
    return;
  }

  const seen = new Set<string>();

  for (const task of pending.data) {
    if (task.syncStatus !== 'pending' || seen.has(task.id)) {
      continue;
    }

    seen.add(task.id);
    await syncTask(task.id);
  }
}

async function runSync(): Promise<void> {
  if (!canSync()) {
    return;
  }

  if (inFlight) {
    queued = true;
    return;
  }

  inFlight = processPendingTasks();
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
