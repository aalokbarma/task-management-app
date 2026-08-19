import { useEffect, useState } from 'react';
import { listTasks, subscribeToTasks } from '../../../database/taskRepository';
import { requestSync } from '../../../services/sync';
import type { AppError, Task } from '../../../types';

export interface TaskListState {
  tasks: Task[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: AppError | null;
  reload: () => void;
  refresh: () => void;
}

function applyListResult(
  result: ReturnType<typeof listTasks>,
  setTasks: (tasks: Task[]) => void,
  setError: (error: AppError | null) => void,
): void {
  if (result.success) {
    setTasks(result.data);
    setError(null);
    return;
  }

  setError(result.error);
}

export function useTaskList(): TaskListState {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    return subscribeToTasks(result => {
      setIsLoading(false);
      if (result.success) {
        setTasks(result.data);
        setError(null);
        return;
      }

      setError(result.error);
    });
  }, []);

  function reload(): void {
    const result = listTasks();
    setIsLoading(false);
    applyListResult(result, setTasks, setError);
  }

  function refresh(): void {
    setIsRefreshing(true);
    requestSync();
    const result = listTasks();
    applyListResult(result, setTasks, setError);
    setIsRefreshing(false);
  }

  return { tasks, isLoading, isRefreshing, error, reload, refresh };
}
