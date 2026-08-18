import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppError, User } from '../../types';
import type { RootState } from '../../app/store';

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  error: AppError | null;
}

const initialState: AuthState = {
  status: 'idle',
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    authSucceeded(state, action: PayloadAction<User>) {
      state.status = 'authenticated';
      state.user = action.payload;
      state.error = null;
    },
    authFailed(state, action: PayloadAction<AppError>) {
      state.status = 'error';
      state.user = null;
      state.error = action.payload;
    },
    authSignedOut(state) {
      state.status = 'unauthenticated';
      state.user = null;
      state.error = null;
    },
  },
});

export const { authLoading, authSucceeded, authFailed, authSignedOut } =
  authSlice.actions;

export const selectAuthStatus = (state: RootState): AuthStatus =>
  state.auth.status;
export const selectAuthUser = (state: RootState): User | null =>
  state.auth.user;
export const selectAuthError = (state: RootState): AppError | null =>
  state.auth.error;

export default authSlice.reducer;
