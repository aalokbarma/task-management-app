import React from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Screen } from '../../../components';
import { useTheme } from '../../../theme';
import type { AppStackParamList } from '../../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'TaskList'>;

export default function TaskListScreen({
  navigation,
}: Props): React.JSX.Element {
  const theme = useTheme();

  return (
    <Screen>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.typography.h2.fontSize,
          fontWeight: theme.typography.h2.fontWeight,
          marginBottom: theme.spacing.md,
        }}
      >
        Tasks
      </Text>
      <Button
        label="Open a task"
        variant="secondary"
        style={{ marginBottom: theme.spacing.sm }}
        onPress={() => navigation.navigate('TaskDetail', { taskId: 'demo' })}
      />
      <Button
        label="Settings"
        variant="secondary"
        onPress={() => navigation.navigate('Settings')}
      />
    </Screen>
  );
}
