import type { AppDispatch } from '../../app/store';
import {
  closeRealm,
  getOpenedRealmUserId,
  isRealmOpen,
  openRealm,
} from '../../database/realm';
import { subscribeToAuthState, getCurrentUser } from '../../services/auth';
import { createAppError, type User } from '../../types';
import { logger } from '../../utils/logger';
import {
  authFailed,
  authLoading,
  authSignedOut,
  authSucceeded,
} from './authSlice';

let unsubscribe: (() => void) | null = null;
let queue: Promise<void> = Promise.resolve();

function enqueue(work: () => Promise<void>): void {
  queue = queue.then(work).catch(error => {
    logger.error(error, 'auth.session');
  });
}

async function applyAuthState(
  dispatch: AppDispatch,
  user: User | null,
): Promise<void> {
  if (!user) {
    dispatch(authSignedOut());
    closeRealm();
    return;
  }

  const realmAlreadyOpen =
    isRealmOpen() && getOpenedRealmUserId() === user.id;

  if (!realmAlreadyOpen) {
    dispatch(authLoading());
  }

  try {
    await openRealm(user.id);
    const currentUser = getCurrentUser();
    if (currentUser?.id !== user.id) {
      if (!currentUser) {
        closeRealm();
      }
      return;
    }

    dispatch(authSucceeded(user));
  } catch (error) {
    logger.error(error, 'auth.openRealm');
    closeRealm();

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.id !== user.id) {
      if (!currentUser) {
        dispatch(authSignedOut());
      }
      return;
    }

    dispatch(
      authFailed(
        createAppError(
          'auth/database',
          'Failed to open the local database.',
        ),
      ),
    );
  }
}

export function startAuthSession(dispatch: AppDispatch): void {
  if (unsubscribe) {
    return;
  }

  dispatch(authLoading());

  unsubscribe = subscribeToAuthState(user => {
    enqueue(() => applyAuthState(dispatch, user));
  });
}

export function stopAuthSession(): void {
  if (!unsubscribe) {
    return;
  }

  unsubscribe();
  unsubscribe = null;
}

export function retryAuthSession(dispatch: AppDispatch): void {
  dispatch(authLoading());
  enqueue(() => applyAuthState(dispatch, getCurrentUser()));
}
