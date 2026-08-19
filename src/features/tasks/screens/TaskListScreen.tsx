import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { EmptyState, ErrorView, Loader, Screen } from '../../../components';
import { OfflineBanner } from '../../connectivity/OfflineBanner';
import { useTheme } from '../../../theme';
import type { AppStackParamList, Task } from '../../../types';
import { TaskItem } from '../components/TaskItem';
import { confirmDeleteTask } from '../confirmDeleteTask';
import { useTaskList } from '../hooks/useTaskList';
import {
  deleteTaskRequested,
  setTaskCompletedRequested,
} from '../taskThunks';
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
  const { tasks, isLoading, isRefreshing, error, reload, refresh } =
    useTaskList();

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

  const onToggleComplete = useCallback(
    async (taskId: string, completed: boolean) => {
      const result = await dispatch(
        setTaskCompletedRequested({ taskId, completed }),
      );
      if (
        setTaskCompletedRequested.rejected.match(result) &&
        result.payload
      ) {
        Alert.alert('Could not update task', result.payload.message);
      }
    },
    [dispatch],
  );

  const onDelete = useCallback(
    (taskId: string) => {
      confirmDeleteTask(() => {
        dispatch(deleteTaskRequested(taskId)).then(result => {
          if (deleteTaskRequested.rejected.match(result) && result.payload) {
            Alert.alert('Could not delete task', result.payload.message);
          }
          return undefined;
        });
      });
    },
    [dispatch],
  );

  const renderItem: ListRenderItem<Task> = useCallback(
    ({ item }) => (
      <TaskItem
        task={item}
        onPress={onTaskPress}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
      />
    ),
    [onDelete, onTaskPress, onToggleComplete],
  );

  const listEmpty = useCallback(() => {
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

    const copy = emptyCopy(filter);
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
  }, [error, filter, isLoading, navigation, reload]);

  return (
    <Screen
      padded={false}
      style={{ paddingHorizontal: theme.spacing.md }}
    >
      <OfflineBanner />
      <View style={[styles.filters, { marginBottom: theme.spacing.sm }]}>
        {FILTERS.map(option => {
          const selected = option.id === filter;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              hitSlop={8}
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
        style={styles.list}
        data={visibleTasks}
        keyExtractor={taskKeyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={listEmpty}
        ItemSeparatorComponent={ItemSeparator}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={[
          { paddingBottom: theme.spacing.md },
          visibleTasks.length === 0 ? styles.listEmpty : null,
        ]}
        initialNumToRender={12}
        windowSize={8}
        maxToRenderPerBatch={8}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}

function emptyCopy(filter: TaskFilter): { title: string; description: string } {
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

function ItemSeparator(): React.JSX.Element {
  const theme = useTheme();
  return <View style={{ height: theme.spacing.sm }} />;
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
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
