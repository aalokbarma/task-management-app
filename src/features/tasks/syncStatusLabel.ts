import type { SyncStatus } from '../../types';

export function syncStatusLabel(status: SyncStatus): string | null {
  // Pending is the normal offline-first state after any local edit
  // (including mark complete). Don't show it — only surface real failures.
  if (status === 'failed') {
    return 'Sync failed';
  }

  return null;
}
