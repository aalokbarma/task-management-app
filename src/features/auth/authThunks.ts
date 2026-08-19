import { createAsyncThunk } from '@reduxjs/toolkit';
import { signIn, signOut, signUp } from '../../services/auth';
import type { AppError, AuthCredentials, User } from '../../types';

export const signInRequested = createAsyncThunk<
  User,
  AuthCredentials,
  { rejectValue: AppError }
>('auth/signInRequested', async (credentials, { rejectWithValue }) => {
  const result = await signIn(credentials);
  if (!result.success) {
    return rejectWithValue(result.error);
  }

  return result.data;
});

export const signUpRequested = createAsyncThunk<
  User,
  AuthCredentials,
  { rejectValue: AppError }
>('auth/signUpRequested', async (credentials, { rejectWithValue }) => {
  const result = await signUp(credentials);
  if (!result.success) {
    return rejectWithValue(result.error);
  }

  return result.data;
});

export const signOutRequested = createAsyncThunk<
  void,
  void,
  { rejectValue: AppError }
>('auth/signOutRequested', async (_, { rejectWithValue }) => {
  const result = await signOut();
  if (!result.success) {
    return rejectWithValue(result.error);
  }
});
