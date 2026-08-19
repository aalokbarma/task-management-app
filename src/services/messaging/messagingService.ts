import {
  deleteToken,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  setBackgroundMessageHandler,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { store } from '../../app/store';
import { getFirebaseApp } from '../../config/firebase';
import { logger } from '../../utils/logger';
import { ensureNotificationPermission } from '../notifications';
import { clearFcmToken, saveFcmToken } from './fcmTokenStore';
import { handleRemoteMessage } from './handleRemoteMessage';

let started = false;
let backgroundHandlerRegistered = false;
let unsubscribeStore: (() => void) | null = null;
let unsubscribeOnMessage: (() => void) | null = null;
let unsubscribeOpened: (() => void) | null = null;
let unsubscribeTokenRefresh: (() => void) | null = null;
let wasAuthenticated = false;
let lastUserId: string | null = null;

function getFirebaseMessaging() {
  return getMessaging(getFirebaseApp());
}

async function persistCurrentToken(userId: string): Promise<void> {
  try {
    const allowed = await ensureNotificationPermission();
    if (!allowed) {
      return;
    }

    const messaging = getFirebaseMessaging();
    await registerDeviceForRemoteMessages(messaging);
    const token = await getToken(messaging);
    const result = await saveFcmToken(userId, token);
    if (!result.success) {
      logger.error(result.error, 'fcm.persist');
    }
  } catch (error) {
    logger.error(error, 'fcm.token');
  }
}

async function removeCurrentToken(userId: string): Promise<void> {
  const result = await clearFcmToken(userId);
  if (!result.success) {
    logger.error(result.error, 'fcm.remove');
  }

  try {
    await deleteToken(getFirebaseMessaging());
  } catch (error) {
    logger.error(error, 'fcm.deleteToken');
  }
}

function onStoreChange(): void {
  const state = store.getState();
  const isAuthenticated = state.auth.status === 'authenticated';
  const userId = state.auth.user?.id ?? null;
  const signedIn = isAuthenticated && !wasAuthenticated;
  const signedOut = !isAuthenticated && wasAuthenticated;
  const previousUserId = lastUserId;

  wasAuthenticated = isAuthenticated;
  lastUserId = userId;

  if (signedIn && userId) {
    persistCurrentToken(userId).catch(error => {
      logger.error(error, 'fcm.signIn');
    });
    return;
  }

  if (signedOut && previousUserId) {
    removeCurrentToken(previousUserId).catch(error => {
      logger.error(error, 'fcm.signOut');
    });
  }
}

export function registerMessagingBackgroundHandler(): void {
  if (backgroundHandlerRegistered) {
    return;
  }

  backgroundHandlerRegistered = true;
  setBackgroundMessageHandler(
    getFirebaseMessaging(),
    async (message: RemoteMessage) => {
      handleRemoteMessage(message, { display: 'background' });
    },
  );
}

export function startMessagingService(): void {
  if (started) {
    return;
  }

  started = true;
  const state = store.getState();
  wasAuthenticated = state.auth.status === 'authenticated';
  lastUserId = state.auth.user?.id ?? null;

  const messaging = getFirebaseMessaging();

  unsubscribeStore = store.subscribe(onStoreChange);
  unsubscribeOnMessage = onMessage(messaging, message => {
    handleRemoteMessage(message, { display: 'foreground' });
  });
  unsubscribeOpened = onNotificationOpenedApp(messaging, message => {
    handleRemoteMessage(message);
  });
  unsubscribeTokenRefresh = onTokenRefresh(messaging, token => {
    const userId = store.getState().auth.user?.id;
    if (!userId) {
      return;
    }

    saveFcmToken(userId, token).then(result => {
      if (!result.success) {
        logger.error(result.error, 'fcm.refresh');
      }
    }).catch(error => {
      logger.error(error, 'fcm.refresh');
    });
  });

  getInitialNotification(messaging)
    .then(message => {
      if (message) {
        handleRemoteMessage(message);
      }
    })
    .catch(error => {
      logger.error(error, 'fcm.initial');
    });

  if (wasAuthenticated && lastUserId) {
    persistCurrentToken(lastUserId).catch(error => {
      logger.error(error, 'fcm.start');
    });
  }
}

export function stopMessagingService(): void {
  if (!started) {
    return;
  }

  unsubscribeStore?.();
  unsubscribeStore = null;
  unsubscribeOnMessage?.();
  unsubscribeOnMessage = null;
  unsubscribeOpened?.();
  unsubscribeOpened = null;
  unsubscribeTokenRefresh?.();
  unsubscribeTokenRefresh = null;
  started = false;
}
