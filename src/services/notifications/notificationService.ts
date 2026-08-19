import notifee, {
  AlarmType,
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  TriggerType,
  type Event,
  type Notification,
} from '@notifee/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { store } from '../../app/store';
import { listTasks } from '../../database/taskRepository';
import { queueTaskNotificationNavigation } from '../../navigation/navigationRef';
import type { Task } from '../../types';
import { logger } from '../../utils/logger';

const CHANNEL_ID = 'task-reminders';
const NOTIFICATION_ID_PREFIX = 'task-';

let started = false;
let backgroundHandlerRegistered = false;
let unsubscribeStore: (() => void) | null = null;
let unsubscribeForeground: (() => void) | null = null;
let appStateSubscription: { remove: () => void } | null = null;
let wasAuthenticated = false;
let channelReady: Promise<void> | null = null;

function notificationIdForTask(taskId: string): string {
  return `${NOTIFICATION_ID_PREFIX}${taskId}`;
}

function taskIdFromNotification(notification?: Notification): string | null {
  const dataId = notification?.data?.taskId;
  if (typeof dataId === 'string' && dataId.length > 0) {
    return dataId;
  }

  const id = notification?.id;
  if (id && id.startsWith(NOTIFICATION_ID_PREFIX)) {
    return id.slice(NOTIFICATION_ID_PREFIX.length);
  }

  return null;
}

function reminderTimestamp(task: Task): number | null {
  if (task.isDeleted || task.completed || !task.dueAt) {
    return null;
  }

  const due = Date.parse(task.dueAt);
  if (Number.isNaN(due) || due <= Date.now()) {
    return null;
  }

  return due;
}

function handleNotificationEvent(event: Event): void {
  if (event.type !== EventType.PRESS) {
    return;
  }

  const taskId = taskIdFromNotification(event.detail.notification);
  if (taskId) {
    queueTaskNotificationNavigation(taskId);
  }
}

async function ensureChannel(): Promise<void> {
  if (!channelReady) {
    channelReady = notifee
      .createChannel({
        id: CHANNEL_ID,
        name: 'Task reminders',
        importance: AndroidImportance.DEFAULT,
      })
      .then(() => undefined)
      .catch(error => {
        channelReady = null;
        logger.error(error, 'notifications.channel');
      });
  }

  await channelReady;
}

async function hasNotificationPermission(): Promise<boolean> {
  const settings = await notifee.getNotificationSettings();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

async function requestNotificationPermission(): Promise<boolean> {
  if (await hasNotificationPermission()) {
    return true;
  }

  const requested = await notifee.requestPermission();
  return (
    requested.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    requested.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

async function cancelTaskReminderInternal(taskId: string): Promise<void> {
  await notifee.cancelNotification(notificationIdForTask(taskId));
  await notifee.cancelTriggerNotification(notificationIdForTask(taskId));
}

async function scheduleReminder(task: Task, timestamp: number): Promise<void> {
  const allowed = await requestNotificationPermission();
  if (!allowed) {
    return;
  }

  await ensureChannel();
  await cancelTaskReminderInternal(task.id);

  await notifee.createTriggerNotification(
    {
      id: notificationIdForTask(task.id),
      title: 'Task reminder',
      body: task.title,
      data: { taskId: task.id },
      android: {
        channelId: CHANNEL_ID,
        pressAction: { id: 'default' },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp,
      alarmManager: {
        type: AlarmType.SET_AND_ALLOW_WHILE_IDLE,
      },
    },
  );
}

async function syncReminderForTaskAsync(task: Task): Promise<void> {
  const timestamp = reminderTimestamp(task);
  if (!timestamp) {
    await cancelTaskReminderInternal(task.id);
    return;
  }

  await scheduleReminder(task, timestamp);
}

async function syncTaskRemindersAsync(): Promise<void> {
  if (store.getState().auth.status !== 'authenticated') {
    return;
  }

  const result = listTasks();
  if (!result.success) {
    logger.error(result.error, 'notifications.listTasks');
    return;
  }

  for (const task of result.data) {
    await syncReminderForTaskAsync(task);
  }
}

async function cancelAllReminders(): Promise<void> {
  await notifee.cancelAllNotifications();
}

export function syncReminderForTask(task: Task): void {
  syncReminderForTaskAsync(task).catch(error => {
    logger.error(error, 'notifications.syncTask');
  });
}

export function cancelTaskReminder(taskId: string): void {
  cancelTaskReminderInternal(taskId).catch(error => {
    logger.error(error, 'notifications.cancel');
  });
}

export function syncTaskReminders(): void {
  syncTaskRemindersAsync().catch(error => {
    logger.error(error, 'notifications.syncAll');
  });
}

export function registerNotificationBackgroundHandler(): void {
  if (backgroundHandlerRegistered) {
    return;
  }

  backgroundHandlerRegistered = true;
  notifee.onBackgroundEvent(async event => {
    handleNotificationEvent(event);
  });
}

function onStoreChange(): void {
  const isAuthenticated = store.getState().auth.status === 'authenticated';
  const signedIn = isAuthenticated && !wasAuthenticated;
  const signedOut = !isAuthenticated && wasAuthenticated;
  wasAuthenticated = isAuthenticated;

  if (signedIn) {
    syncTaskReminders();
    return;
  }

  if (signedOut) {
    cancelAllReminders().catch(error => {
      logger.error(error, 'notifications.cancelAll');
    });
  }
}

function onAppStateChange(nextState: AppStateStatus): void {
  if (nextState === 'active') {
    syncTaskReminders();
  }
}

export function startNotificationService(): void {
  if (started) {
    return;
  }

  started = true;
  wasAuthenticated = store.getState().auth.status === 'authenticated';

  unsubscribeStore = store.subscribe(onStoreChange);
  unsubscribeForeground = notifee.onForegroundEvent(handleNotificationEvent);
  appStateSubscription = AppState.addEventListener('change', onAppStateChange);

  notifee
    .getInitialNotification()
    .then(initial => {
      const taskId = taskIdFromNotification(initial?.notification);
      if (taskId) {
        queueTaskNotificationNavigation(taskId);
      }
    })
    .catch(error => {
      logger.error(error, 'notifications.initial');
    });

  if (wasAuthenticated) {
    syncTaskReminders();
  }
}

export function stopNotificationService(): void {
  if (!started) {
    return;
  }

  unsubscribeStore?.();
  unsubscribeStore = null;
  unsubscribeForeground?.();
  unsubscribeForeground = null;
  appStateSubscription?.remove();
  appStateSubscription = null;
  started = false;
}
