import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { ThemeMode } from '../../types';

export type { ThemeMode };

export interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: 'system',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    themeModeChanged(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
  },
});

export const { themeModeChanged } = themeSlice.actions;

export const selectThemeMode = (state: RootState): ThemeMode =>
  state.theme.mode;

export default themeSlice.reducer;
