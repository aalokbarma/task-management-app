export type SyncStatus = 'synced' | 'pending' | 'failed';

export type SyncOperation = 'create' | 'update' | 'delete';

export interface Syncable {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
  operation: SyncOperation;
  version: number;
}
