import { darkColors, lightColors, ThemeColors } from './colors';
import { radii, ThemeRadii } from './radii';
import { shadows, ThemeShadows } from './shadows';
import { spacing, ThemeSpacing } from './spacing';
import { typography, ThemeTypography } from './typography';

export type ThemeScheme = 'light' | 'dark';

export interface Theme {
  scheme: ThemeScheme;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  radii: ThemeRadii;
  shadows: ThemeShadows;
}

export const lightTheme: Theme = {
  scheme: 'light',
  colors: lightColors,
  spacing,
  typography,
  radii,
  shadows,
};

export const darkTheme: Theme = {
  scheme: 'dark',
  colors: darkColors,
  spacing,
  typography,
  radii,
  shadows,
};
