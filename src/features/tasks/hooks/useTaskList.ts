import { useEffect, useState } from 'react';
import { listTasks, subscribeToTasks } from '../../../database/taskRepository';
import type { AppError, Task } from '../../../types';

export interface TaskListState {
  tasks: Task[];
  isLoading: boolean;
  error: AppError | null;
  reload: () => void;
}

export function useTaskList(): TaskListState {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    if (result.success) {
      setTasks(result.data);
      setError(null);
      return;
    }

    setError(result.error);
  }

  return { tasks, isLoading, error, reload };
}
