import type { Syncable } from './sync';

export interface Task extends Syncable {
  title: string;
  description?: string;
  dueAt?: string;
  completed: boolean;
  isDeleted: boolean;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueAt?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  dueAt?: string;
  completed?: boolean;
}
