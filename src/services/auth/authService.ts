import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseAuthUser,
} from '@react-native-firebase/auth';
import { getFirebaseApp } from '../../config/firebase';
import type { AuthCredentials, Result, User } from '../../types';
import { logger } from '../../utils/logger';
import { mapAuthError } from './mapAuthError';
import { validateCredentials } from './validateCredentials';

function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function mapFirebaseUser(firebaseUser: FirebaseAuthUser): User {
  const user: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    emailVerified: firebaseUser.emailVerified,
  };

  if (firebaseUser.displayName) {
    user.displayName = firebaseUser.displayName;
  }

  return user;
}

export async function signUp(
  credentials: AuthCredentials,
): Promise<Result<User>> {
  const validation = validateCredentials(credentials);
  if (!validation.success) {
    return validation;
  }

  try {
    const credential = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      validation.data.email,
      validation.data.password,
    );

    return { success: true, data: mapFirebaseUser(credential.user) };
  } catch (error) {
    logger.error(error, 'auth.signUp');
    return { success: false, error: mapAuthError(error) };
  }
}

export async function signIn(
  credentials: AuthCredentials,
): Promise<Result<User>> {
  const validation = validateCredentials(credentials);
  if (!validation.success) {
    return validation;
  }

  try {
    const credential = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      validation.data.email,
      validation.data.password,
    );

    return { success: true, data: mapFirebaseUser(credential.user) };
  } catch (error) {
    logger.error(error, 'auth.signIn');
    return { success: false, error: mapAuthError(error) };
  }
}

export async function signOut(): Promise<Result<void>> {
  try {
    await firebaseSignOut(getFirebaseAuth());
    return { success: true, data: undefined };
  } catch (error) {
    logger.error(error, 'auth.signOut');
    return { success: false, error: mapAuthError(error) };
  }
}

export function getCurrentUser(): User | null {
  const currentUser = getFirebaseAuth().currentUser;

  if (!currentUser) {
    return null;
  }

  return mapFirebaseUser(currentUser);
}

export function subscribeToAuthState(
  listener: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(getFirebaseAuth(), firebaseUser => {
    listener(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
  });
}
