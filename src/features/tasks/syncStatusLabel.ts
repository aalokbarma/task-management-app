import type { SyncStatus } from '../../types';

export function syncStatusLabel(status: SyncStatus): string | null {
  if (status === 'pending') {
    return 'Waiting to sync';
  }

  if (status === 'failed') {
    return 'Sync failed';
  }

  return null;
}
