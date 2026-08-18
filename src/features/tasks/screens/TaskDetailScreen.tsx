import React from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../../components';
import { useTheme } from '../../../theme';
import type { AppStackParamList } from '../../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen({ route }: Props): React.JSX.Element {
  const theme = useTheme();
  const taskId = route.params?.taskId;

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
        Task Detail
      </Text>
      <Text style={{ color: theme.colors.textSecondary }}>
        {taskId ? `Task ID: ${taskId}` : 'New task'}
      </Text>
    </Screen>
  );
}
