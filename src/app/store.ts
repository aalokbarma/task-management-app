import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import connectivityReducer from '../features/connectivity/connectivitySlice';
import tasksUiReducer from '../features/tasks/tasksUiSlice';
import themeReducer from '../features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    connectivity: connectivityReducer,
    theme: themeReducer,
    tasksUi: tasksUiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
