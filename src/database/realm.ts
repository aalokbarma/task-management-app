import Realm from 'realm';
import { logger } from '../utils/logger';
import { TaskObject } from './schemas/TaskObject';

export const REALM_SCHEMA_VERSION = 1;

let realm: Realm | null = null;
let openedForUserId: string | null = null;

function realmPathForUser(userId: string): string {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `taskapp-${safeUserId}.realm`;
}

export function isRealmOpen(): boolean {
  return realm !== null && !realm.isClosed;
}

export function getRealm(): Realm {
  if (!realm || realm.isClosed) {
    throw new Error(
      'The local database is not open. Open it after the user signs in.',
    );
  }

  return realm;
}

export function getOpenedRealmUserId(): string | null {
  if (!isRealmOpen()) {
    return null;
  }

  return openedForUserId;
}

export function closeRealm(): void {
  if (realm && !realm.isClosed) {
    realm.close();
  }

  realm = null;
  openedForUserId = null;
}

export async function openRealm(userId: string): Promise<Realm> {
  const trimmedUserId = userId.trim();

  if (!trimmedUserId) {
    throw new Error('Cannot open the local database without a user id.');
  }

  if (isRealmOpen() && openedForUserId === trimmedUserId) {
    return getRealm();
  }

  closeRealm();

  try {
    realm = await Realm.open({
      schema: [TaskObject],
      schemaVersion: REALM_SCHEMA_VERSION,
      path: realmPathForUser(trimmedUserId),
    });
    openedForUserId = trimmedUserId;
    return realm;
  } catch (error) {
    logger.error(error, 'database.openRealm');
    realm = null;
    openedForUserId = null;
    throw new Error('Failed to open the local database.');
  }
}
