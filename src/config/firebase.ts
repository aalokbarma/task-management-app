import { getApp, getApps, type FirebaseApp } from '@react-native-firebase/app';
import { env } from './env';

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    throw new Error(
      `Firebase is not initialized for the ${env.environment} environment. Add google-services.json and GoogleService-Info.plist from the Firebase console to config/firebase/${env.environment}/.`,
    );
  }

  return getApp();
}
