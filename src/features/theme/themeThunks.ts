import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch } from '../../app/store';
import {
  loadThemeMode,
  saveThemeMode,
} from '../../services/theme';
import type { ThemeMode } from '../../types';
import { logger } from '../../utils/logger';
import { themeModeChanged } from './themeSlice';

export function startThemePreference(dispatch: AppDispatch): void {
  hydrateThemePreference(dispatch).catch(error => {
    logger.error(error, 'theme.hydrate');
  });
}

export async function hydrateThemePreference(
  dispatch: AppDispatch,
): Promise<void> {
  const mode = await loadThemeMode();
  if (mode) {
    dispatch(themeModeChanged(mode));
  }
}

export const setThemeModeRequested = createAsyncThunk<void, ThemeMode>(
  'theme/setModeRequested',
  async (mode, { dispatch }) => {
    dispatch(themeModeChanged(mode));
    await saveThemeMode(mode);
  },
);
