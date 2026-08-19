import {
  deleteField,
  doc,
  getFirestore,
  setDoc,
} from '@react-native-firebase/firestore';
import { Platform } from 'react-native';
import { getFirebaseApp } from '../../config/firebase';
import type { Result } from '../../types';
import { logger } from '../../utils/logger';
import { mapFirestoreError } from '../tasks';

function getUserDocument(userId: string) {
  return doc(getFirestore(getFirebaseApp()), 'users', userId);
}

export async function saveFcmToken(
  userId: string,
  token: string,
): Promise<Result<void>> {
  if (!userId.trim() || !token.trim()) {
    return { success: true, data: undefined };
  }

  try {
    await setDoc(
      getUserDocument(userId),
      {
        fcmToken: token,
        fcmPlatform: Platform.OS,
        fcmUpdatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
    return { success: true, data: undefined };
  } catch (error) {
    logger.error(error, 'fcm.saveToken');
    return { success: false, error: mapFirestoreError(error) };
  }
}

export async function clearFcmToken(userId: string): Promise<Result<void>> {
  if (!userId.trim()) {
    return { success: true, data: undefined };
  }

  try {
    await setDoc(
      getUserDocument(userId),
      {
        fcmToken: deleteField(),
        fcmPlatform: deleteField(),
        fcmUpdatedAt: deleteField(),
      },
      { merge: true },
    );
    return { success: true, data: undefined };
  } catch (error) {
    logger.error(error, 'fcm.clearToken');
    return { success: false, error: mapFirestoreError(error) };
  }
}
