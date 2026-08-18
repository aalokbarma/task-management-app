import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import type { AuthStackParamList } from '../types';
import { lazyScreen } from './lazyScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const LoginScreen = lazyScreen(
  () => import('../features/auth/screens/LoginScreen'),
);
const SignUpScreen = lazyScreen(
  () => import('../features/auth/screens/SignUpScreen'),
);

export function AuthNavigator(): React.JSX.Element {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Log In' }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ title: 'Sign Up' }}
      />
    </Stack.Navigator>
  );
}
