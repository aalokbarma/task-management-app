import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
} from '@react-native-firebase/firestore';
import { getFirebaseApp } from '../../config/firebase';
import {
  createAppError,
  type Result,
  type Task,
} from '../../types';
import { logger } from '../../utils/logger';
import { mapFirestoreError } from './mapFirestoreError';

const USERS_COLLECTION = 'users';
const TASKS_COLLECTION = 'tasks';

interface RemoteTaskDocument {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

function getTaskCollection(userId: string) {
  return collection(
    getFirestore(getFirebaseApp()),
    USERS_COLLECTION,
    userId,
    TASKS_COLLECTION,
  );
}

function getTaskDocument(userId: string, taskId: string) {
  return doc(getTaskCollection(userId), taskId);
}

function requireIds(
  userId: string,
  taskId?: string,
): Result<void> {
  if (!userId.trim()) {
    return {
      success: false,
      error: createAppError(
        'firestore/invalid-argument',
        'A user id is required to sync tasks.',
      ),
    };
  }

  if (taskId !== undefined && !taskId.trim()) {
    return {
      success: false,
      error: createAppError(
        'firestore/invalid-argument',
        'A task id is required to sync this task.',
      ),
    };
  }

  return { success: true, data: undefined };
}

function toRemoteTaskDocument(task: Task): RemoteTaskDocument {
  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    description: task.description ?? null,
    dueAt: task.dueAt ?? null,
    completed: task.completed,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    version: task.version,
  };
}

function isRemoteTaskDocument(value: unknown): value is RemoteTaskDocument {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const document = value as Record<string, unknown>;

  return (
    typeof document.id === 'string' &&
    typeof document.userId === 'string' &&
    typeof document.title === 'string' &&
    (document.description === null || typeof document.description === 'string') &&
    (document.dueAt === null || typeof document.dueAt === 'string') &&
    typeof document.completed === 'boolean' &&
    typeof document.createdAt === 'string' &&
    typeof document.updatedAt === 'string' &&
    typeof document.version === 'number'
  );
}

export function mapRemoteTask(
  data: unknown,
  documentId: string,
): Task | null {
  if (!isRemoteTaskDocument(data) || data.id !== documentId) {
    return null;
  }

  const task: Task = {
    id: data.id,
    userId: data.userId,
    title: data.title,
    completed: data.completed,
    isDeleted: false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    syncStatus: 'synced',
    operation: 'update',
    version: data.version,
  };

  if (data.description) {
    task.description = data.description;
  }

  if (data.dueAt) {
    task.dueAt = data.dueAt;
  }

  return task;
}

export async function upsertRemoteTask(task: Task): Promise<Result<void>> {
  const ids = requireIds(task.userId, task.id);
  if (!ids.success) {
    return ids;
  }

  try {
    await setDoc(getTaskDocument(task.userId, task.id), toRemoteTaskDocument(task));
    return { success: true, data: undefined };
  } catch (error) {
    logger.error(error, 'firestore.upsertRemoteTask');
    return { success: false, error: mapFirestoreError(error) };
  }
}

export async function deleteRemoteTask(
  userId: string,
  taskId: string,
): Promise<Result<void>> {
  const ids = requireIds(userId, taskId);
  if (!ids.success) {
    return ids;
  }

  try {
    await deleteDoc(getTaskDocument(userId, taskId));
    return { success: true, data: undefined };
  } catch (error) {
    logger.error(error, 'firestore.deleteRemoteTask');
    return { success: false, error: mapFirestoreError(error) };
  }
}

export async function getRemoteTask(
  userId: string,
  taskId: string,
): Promise<Result<Task | null>> {
  const ids = requireIds(userId, taskId);
  if (!ids.success) {
    return ids;
  }

  try {
    const snapshot = await getDoc(getTaskDocument(userId, taskId));
    if (!snapshot.exists()) {
      return { success: true, data: null };
    }

    const task = mapRemoteTask(snapshot.data(), snapshot.id);
    if (!task) {
      return {
        success: false,
        error: createAppError(
          'firestore/invalid-argument',
          'The remote task data is invalid.',
        ),
      };
    }

    return { success: true, data: task };
  } catch (error) {
    logger.error(error, 'firestore.getRemoteTask');
    return { success: false, error: mapFirestoreError(error) };
  }
}

export async function listRemoteTasks(userId: string): Promise<Result<Task[]>> {
  const ids = requireIds(userId);
  if (!ids.success) {
    return ids;
  }

  try {
    const snapshot = await getDocs(getTaskCollection(userId));
    const tasks: Task[] = [];

    snapshot.forEach(documentSnapshot => {
      const task = mapRemoteTask(documentSnapshot.data(), documentSnapshot.id);
      if (!task) {
        logger.error(
          { id: documentSnapshot.id, userId },
          'firestore.listRemoteTasks.invalidDocument',
        );
        return;
      }

      tasks.push(task);
    });

    return { success: true, data: tasks };
  } catch (error) {
    logger.error(error, 'firestore.listRemoteTasks');
    return { success: false, error: mapFirestoreError(error) };
  }
}
