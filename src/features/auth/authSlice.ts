import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { DEFAULT_AUTH_ERROR_MESSAGE } from '../../services/auth';
import { createAppError, type AppError, type User } from '../../types';
import {
  signInRequested,
  signOutRequested,
  signUpRequested,
} from './authThunks';

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

function rejectedAuthError(payload: AppError | undefined): AppError {
  return (
    payload ??
    createAppError('auth/unknown', DEFAULT_AUTH_ERROR_MESSAGE)
  );
}

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
  extraReducers: builder => {
    builder.addCase(signInRequested.pending, state => {
      state.error = null;
    });
    builder.addCase(signInRequested.rejected, (state, action) => {
      state.status = 'unauthenticated';
      state.user = null;
      state.error = rejectedAuthError(action.payload);
    });
    builder.addCase(signUpRequested.pending, state => {
      state.error = null;
    });
    builder.addCase(signUpRequested.rejected, (state, action) => {
      state.status = 'unauthenticated';
      state.user = null;
      state.error = rejectedAuthError(action.payload);
    });
    builder.addCase(signOutRequested.rejected, (state, action) => {
      state.error = rejectedAuthError(action.payload);
    });
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
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.status === 'authenticated';

export default authSlice.reducer;
