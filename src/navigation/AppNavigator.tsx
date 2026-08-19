import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsHeaderButton } from '../features/settings/components/SettingsHeaderButton';
import { useTheme } from '../theme';
import type { AppStackParamList } from '../types';
import { lazyScreen } from './lazyScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

const TaskListScreen = lazyScreen(
  () => import('../features/tasks/screens/TaskListScreen'),
);
const TaskDetailScreen = lazyScreen(
  () => import('../features/tasks/screens/TaskDetailScreen'),
);
const SettingsScreen = lazyScreen(
  () => import('../features/settings/screens/SettingsScreen'),
);

export function AppNavigator(): React.JSX.Element {
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
        name="TaskList"
        component={TaskListScreen}
        options={{ title: 'Tasks', headerRight: SettingsHeaderButton }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Task' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}
