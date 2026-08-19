import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { EmptyState, ErrorView, Loader, Screen } from '../../../components';
import { useTheme } from '../../../theme';
import type { AppStackParamList, Task } from '../../../types';
import { TaskItem } from '../components/TaskItem';
import { useTaskList } from '../hooks/useTaskList';
import {
  selectTaskFilter,
  taskFilterChanged,
  type TaskFilter,
} from '../tasksUiSlice';

type Props = NativeStackScreenProps<AppStackParamList, 'TaskList'>;

const FILTERS: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

function taskKeyExtractor(item: Task): string {
  return item.id;
}

export default function TaskListScreen({
  navigation,
}: Props): React.JSX.Element {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const filter = useAppSelector(selectTaskFilter);
  const { tasks, isLoading, error, reload } = useTaskList();

  const visibleTasks = useMemo(() => {
    if (filter === 'active') {
      return tasks.filter(task => !task.completed);
    }

    if (filter === 'completed') {
      return tasks.filter(task => task.completed);
    }

    return tasks;
  }, [filter, tasks]);

  const onTaskPress = useCallback(
    (taskId: string) => {
      navigation.navigate('TaskDetail', { taskId });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<Task> = useCallback(
    ({ item }) => <TaskItem task={item} onPress={onTaskPress} />,
    [onTaskPress],
  );

  function emptyCopy(): { title: string; description: string } {
    if (filter === 'completed') {
      return {
        title: 'No completed tasks',
        description: 'Completed tasks will show up here.',
      };
    }

    if (filter === 'active') {
      return {
        title: 'No active tasks',
        description: 'Add a task to get started.',
      };
    }

    return {
      title: 'No tasks yet',
      description: 'Add a task to keep it on this device, even offline.',
    };
  }

  function listEmpty(): React.JSX.Element {
    if (isLoading) {
      return (
        <View style={styles.emptyWrap}>
          <Loader />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyWrap}>
          <ErrorView message={error.message} onRetry={reload} />
        </View>
      );
    }

    const copy = emptyCopy();
    return (
      <View style={styles.emptyWrap}>
        <EmptyState
          title={copy.title}
          description={copy.description}
          actionLabel={filter === 'completed' ? undefined : 'Add a task'}
          onAction={
            filter === 'completed'
              ? undefined
              : () => navigation.navigate('TaskDetail')
          }
        />
      </View>
    );
  }

  return (
    <Screen
      padded={false}
      style={{ paddingHorizontal: theme.spacing.md }}
    >
      <View style={[styles.filters, { marginBottom: theme.spacing.sm }]}>
        {FILTERS.map(option => {
          const selected = option.id === filter;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => dispatch(taskFilterChanged(option.id))}
              style={[
                styles.filterChip,
                {
                  borderColor: selected
                    ? theme.colors.primary
                    : theme.colors.border,
                  backgroundColor: selected
                    ? theme.colors.primary
                    : theme.colors.surface,
                  borderRadius: theme.radii.md,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  marginRight: theme.spacing.xs,
                },
              ]}
            >
              <Text
                style={{
                  color: selected
                    ? theme.colors.onPrimary
                    : theme.colors.text,
                  fontSize: theme.typography.caption.fontSize,
                  fontWeight: theme.typography.bodyBold.fontWeight,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <FlatList
        data={visibleTasks}
        keyExtractor={taskKeyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={listEmpty()}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={[
          { paddingBottom: theme.spacing.md },
          visibleTasks.length === 0 ? styles.listEmpty : null,
        ]}
        initialNumToRender={12}
        windowSize={8}
        maxToRenderPerBatch={8}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}

function ItemSeparator(): React.JSX.Element {
  const theme = useTheme();
  return <View style={{ height: theme.spacing.sm }} />;
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  listEmpty: {
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
});
