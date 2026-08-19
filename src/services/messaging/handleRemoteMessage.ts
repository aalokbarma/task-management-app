import type { RemoteMessage } from '@react-native-firebase/messaging';
import { queueTaskNotificationNavigation } from '../../navigation/navigationRef';
import { displayIncomingPush } from '../notifications';
import { requestSync } from '../sync';

function dataValue(
  data: RemoteMessage['data'],
  key: string,
): string | undefined {
  const value = data?.[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function handleRemoteMessage(
  message: RemoteMessage,
  options?: { display?: 'foreground' | 'background' },
): void {
  const taskId = dataValue(message.data, 'taskId');
  const type = dataValue(message.data, 'type');
  const title =
    message.notification?.title ?? dataValue(message.data, 'title');
  const body = message.notification?.body ?? dataValue(message.data, 'body');

  const shouldDisplay =
    Boolean(body) &&
    (options?.display === 'foreground' ||
      (options?.display === 'background' && !message.notification));

  if (shouldDisplay && body) {
    displayIncomingPush({
      title: title ?? 'Task App',
      body,
      taskId,
    });
  }

  if (taskId) {
    queueTaskNotificationNavigation(taskId);
  }

  if (type === 'sync' || type === 'task' || taskId) {
    requestSync();
  }
}
