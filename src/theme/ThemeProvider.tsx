import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppSelector } from '../app/hooks';
import { selectThemeMode } from '../features/theme/themeSlice';
import { darkTheme, lightTheme, Theme } from './theme';

const ThemeContext = createContext<Theme>(lightTheme);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({
  children,
}: ThemeProviderProps): React.JSX.Element {
  const mode = useAppSelector(selectThemeMode);
  const colorScheme = useColorScheme();
  const theme = useMemo(() => {
    if (mode === 'dark') {
      return darkTheme;
    }

    if (mode === 'light') {
      return lightTheme;
    }

    return colorScheme === 'dark' ? darkTheme : lightTheme;
  }, [mode, colorScheme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
