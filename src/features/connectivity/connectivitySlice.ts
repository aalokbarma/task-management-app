import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

export interface ConnectivityState {
  isOnline: boolean;
  isInternetReachable: boolean | null;
}

const initialState: ConnectivityState = {
  isOnline: true,
  isInternetReachable: null,
};

const connectivitySlice = createSlice({
  name: 'connectivity',
  initialState,
  reducers: {
    connectivityChanged(
      state,
      action: PayloadAction<ConnectivityState>,
    ) {
      state.isOnline = action.payload.isOnline;
      state.isInternetReachable = action.payload.isInternetReachable;
    },
  },
});

export const { connectivityChanged } = connectivitySlice.actions;

export const selectIsOnline = (state: RootState): boolean =>
  state.connectivity.isOnline;

export default connectivitySlice.reducer;
