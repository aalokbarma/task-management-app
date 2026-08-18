import React from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import { useAppSelector } from '../app/hooks';
import { Loader } from '../components';
import { selectAuthStatus } from '../features/auth/authSlice';
import { useTheme } from '../theme';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

export function RootNavigator(): React.JSX.Element {
  const authStatus = useAppSelector(selectAuthStatus);
  const theme = useTheme();

  if (authStatus === 'loading') {
    return <Loader fullscreen />;
  }

  const baseNavigationTheme =
    theme.scheme === 'dark' ? DarkTheme : DefaultTheme;

  const navigationTheme: NavigationTheme = {
    ...baseNavigationTheme,
    colors: {
      ...baseNavigationTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  return (
    <NavigationContainer
      theme={navigationTheme}
      onReady={() => {
        BootSplash.hide({ fade: true });
      }}
    >
      {authStatus === 'authenticated' ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
