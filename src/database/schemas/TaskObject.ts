import Realm from 'realm';
import type { SyncOperation, SyncStatus } from '../../types';

export class TaskObject extends Realm.Object<TaskObject> {
  id!: string;
  userId!: string;
  title!: string;
  description!: string | null;
  dueAt!: string | null;
  completed!: boolean;
  isDeleted!: boolean;
  createdAt!: string;
  updatedAt!: string;
  syncStatus!: SyncStatus;
  operation!: SyncOperation;
  version!: number;

  static schema: Realm.ObjectSchema = {
    name: 'Task',
    primaryKey: 'id',
    properties: {
      id: 'string',
      userId: { type: 'string', indexed: true },
      title: 'string',
      description: 'string?',
      dueAt: 'string?',
      completed: { type: 'bool', default: false },
      isDeleted: { type: 'bool', default: false, indexed: true },
      createdAt: 'string',
      updatedAt: 'string',
      syncStatus: { type: 'string', indexed: true },
      operation: 'string',
      version: { type: 'int', default: 1 },
    },
  };
}
