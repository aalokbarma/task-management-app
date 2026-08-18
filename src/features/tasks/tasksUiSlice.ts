import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppError } from '../../types';
import type { RootState } from '../../app/store';

export type TaskFilter = 'all' | 'active' | 'completed';

export interface TasksUiState {
  filter: TaskFilter;
  isSubmitting: boolean;
  error: AppError | null;
}

const initialState: TasksUiState = {
  filter: 'all',
  isSubmitting: false,
  error: null,
};

const tasksUiSlice = createSlice({
  name: 'tasksUi',
  initialState,
  reducers: {
    taskFilterChanged(state, action: PayloadAction<TaskFilter>) {
      state.filter = action.payload;
    },
    taskSubmissionStarted(state) {
      state.isSubmitting = true;
      state.error = null;
    },
    taskSubmissionFinished(state) {
      state.isSubmitting = false;
    },
    taskErrorSet(state, action: PayloadAction<AppError | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  taskFilterChanged,
  taskSubmissionStarted,
  taskSubmissionFinished,
  taskErrorSet,
} = tasksUiSlice.actions;

export const selectTaskFilter = (state: RootState): TaskFilter =>
  state.tasksUi.filter;
export const selectIsTaskSubmitting = (state: RootState): boolean =>
  state.tasksUi.isSubmitting;
export const selectTaskUiError = (state: RootState): AppError | null =>
  state.tasksUi.error;

export default tasksUiSlice.reducer;
