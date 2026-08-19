import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createTask,
  deleteTask,
  setTaskCompleted,
  updateTask,
} from '../../database/taskRepository';
import type { AppError, CreateTaskInput, Task, UpdateTaskInput } from '../../types';
import {
  taskErrorSet,
  taskSubmissionFinished,
  taskSubmissionStarted,
} from './tasksUiSlice';

export const createTaskRequested = createAsyncThunk<
  Task,
  CreateTaskInput,
  { rejectValue: AppError }
>('tasks/createRequested', async (input, { dispatch, rejectWithValue }) => {
  dispatch(taskSubmissionStarted());
  const result = createTask(input);
  dispatch(taskSubmissionFinished());

  if (!result.success) {
    dispatch(taskErrorSet(result.error));
    return rejectWithValue(result.error);
  }

  return result.data;
});

export const updateTaskRequested = createAsyncThunk<
  Task,
  { taskId: string; input: UpdateTaskInput },
  { rejectValue: AppError }
>(
  'tasks/updateRequested',
  async ({ taskId, input }, { dispatch, rejectWithValue }) => {
    dispatch(taskSubmissionStarted());
    const result = updateTask(taskId, input);
    dispatch(taskSubmissionFinished());

    if (!result.success) {
      dispatch(taskErrorSet(result.error));
      return rejectWithValue(result.error);
    }

    return result.data;
  },
);

export const setTaskCompletedRequested = createAsyncThunk<
  Task,
  { taskId: string; completed: boolean },
  { rejectValue: AppError }
>(
  'tasks/setCompletedRequested',
  async ({ taskId, completed }, { rejectWithValue }) => {
    const result = setTaskCompleted(taskId, completed);
    if (!result.success) {
      return rejectWithValue(result.error);
    }

    return result.data;
  },
);

export const deleteTaskRequested = createAsyncThunk<
  void,
  string,
  { rejectValue: AppError }
>('tasks/deleteRequested', async (taskId, { dispatch, rejectWithValue }) => {
  dispatch(taskSubmissionStarted());
  const result = deleteTask(taskId);
  dispatch(taskSubmissionFinished());

  if (!result.success) {
    dispatch(taskErrorSet(result.error));
    return rejectWithValue(result.error);
  }
});
