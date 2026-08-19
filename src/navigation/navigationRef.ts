import { createNavigationContainerRef } from '@react-navigation/native';
import { store } from '../app/store';
import type { NavigationParamList } from '../types';

export const navigationRef = createNavigationContainerRef<NavigationParamList>();

let pendingTaskId: string | null = null;

export function queueTaskNotificationNavigation(taskId: string): void {
  pendingTaskId = taskId;
  consumePendingNotificationNavigation();
}

export function consumePendingNotificationNavigation(): void {
  if (!pendingTaskId || !navigationRef.isReady()) {
    return;
  }

  if (store.getState().auth.status !== 'authenticated') {
    return;
  }

  const taskId = pendingTaskId;
  pendingTaskId = null;
  navigationRef.navigate('TaskDetail', { taskId });
}
