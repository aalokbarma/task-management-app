import React, { useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { ErrorView, Loader, Screen } from '../../../components';
import type {
  AppStackParamList,
  CreateTaskInput,
  UpdateTaskInput,
} from '../../../types';
import { TaskForm } from '../components/TaskForm';
import { confirmDeleteTask } from '../confirmDeleteTask';
import { useTask } from '../hooks/useTask';
import {
  createTaskRequested,
  deleteTaskRequested,
  setTaskCompletedRequested,
  updateTaskRequested,
} from '../taskThunks';
import {
  selectIsTaskSubmitting,
  selectTaskUiError,
  taskErrorSet,
} from '../tasksUiSlice';

type Props = NativeStackScreenProps<AppStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const taskId = route.params?.taskId;
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsTaskSubmitting);
  const formError = useAppSelector(selectTaskUiError);
  const { task, isLoading, error, reload } = useTask(taskId);

  useEffect(() => {
    return () => {
      dispatch(taskErrorSet(null));
    };
  }, [dispatch]);

  async function handleCreate(input: CreateTaskInput): Promise<void> {
    const result = await dispatch(createTaskRequested(input));
    if (createTaskRequested.fulfilled.match(result)) {
      navigation.goBack();
    }
  }

  async function handleUpdate(input: UpdateTaskInput): Promise<void> {
    if (!taskId) {
      return;
    }

    const result = await dispatch(updateTaskRequested({ taskId, input }));
    if (updateTaskRequested.fulfilled.match(result)) {
      navigation.goBack();
    }
  }

  async function handleToggleComplete(): Promise<void> {
    if (!taskId || !task) {
      return;
    }

    const result = await dispatch(
      setTaskCompletedRequested({
        taskId,
        completed: !task.completed,
      }),
    );

    if (setTaskCompletedRequested.fulfilled.match(result)) {
      reload();
      return;
    }

    if (result.payload) {
      dispatch(taskErrorSet(result.payload));
    }
  }

  function handleDeletePress(): void {
    if (!taskId) {
      return;
    }

    confirmDeleteTask(() => {
      dispatch(deleteTaskRequested(taskId)).then(result => {
        if (deleteTaskRequested.fulfilled.match(result)) {
          navigation.goBack();
        }
      });
    });
  }

  if (taskId && isLoading) {
    return (
      <Screen>
        <Loader fullscreen />
      </Screen>
    );
  }

  if (taskId && (error || !task)) {
    const canRetry = error?.code !== 'task/not-found';
    return (
      <Screen>
        <ErrorView
          message={error?.message ?? 'That task could not be found.'}
          onRetry={canRetry ? reload : undefined}
        />
      </Screen>
    );
  }

  return (
    <TaskForm
      mode={taskId ? 'edit' : 'create'}
      initialTitle={task?.title}
      initialDescription={task?.description}
      initialDueAt={task?.dueAt}
      isSubmitting={isSubmitting}
      formError={formError}
      onSubmitCreate={handleCreate}
      onSubmitUpdate={handleUpdate}
      onDismissFormError={() => dispatch(taskErrorSet(null))}
      completed={task?.completed}
      syncStatus={task?.syncStatus}
      onToggleComplete={taskId ? handleToggleComplete : undefined}
      onDelete={taskId ? handleDeletePress : undefined}
    />
  );
}
