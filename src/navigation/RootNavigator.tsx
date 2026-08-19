import React from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { ErrorView, Loader, Screen } from '../components';
import {
  selectAuthError,
  selectAuthStatus,
} from '../features/auth/authSlice';
import { retryAuthSession } from '../features/auth/authSession';
import { useTheme } from '../theme';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import {
  consumePendingNotificationNavigation,
  navigationRef,
} from './navigationRef';

export function RootNavigator(): React.JSX.Element {
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const dispatch = useAppDispatch();
  const theme = useTheme();

  React.useEffect(() => {
    if (authStatus === 'error') {
      BootSplash.hide({ fade: true });
    }
  }, [authStatus]);

  React.useEffect(() => {
    if (authStatus === 'authenticated') {
      consumePendingNotificationNavigation();
    }
  }, [authStatus]);

  if (authStatus === 'idle' || authStatus === 'loading') {
    return <Loader fullscreen />;
  }

  if (authStatus === 'error') {
    return (
      <Screen>
        <ErrorView
          message={
            authError?.message ?? 'Failed to restore your session.'
          }
          onRetry={() => retryAuthSession(dispatch)}
        />
      </Screen>
    );
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
      ref={navigationRef}
      theme={navigationTheme}
      onReady={() => {
        BootSplash.hide({ fade: true });
        consumePendingNotificationNavigation();
      }}
    >
      {authStatus === 'authenticated' ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
