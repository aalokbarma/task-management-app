import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '../../types';
import { logger } from '../../utils/logger';

const STORAGE_KEY = 'theme.mode';

function isThemeMode(value: string): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

export async function loadThemeMode(): Promise<ThemeMode | null> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (value && isThemeMode(value)) {
      return value;
    }

    return null;
  } catch (error) {
    logger.error(error, 'theme.load');
    return null;
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  } catch (error) {
    logger.error(error, 'theme.save');
  }
}
