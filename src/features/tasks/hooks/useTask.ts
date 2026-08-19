import { useCallback, useEffect, useState } from 'react';
import { getTask } from '../../../database/taskRepository';
import type { AppError, Task } from '../../../types';

export interface TaskQueryState {
  task: Task | null;
  isLoading: boolean;
  error: AppError | null;
  reload: () => void;
}

export function useTask(taskId: string | undefined): TaskQueryState {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(taskId));
  const [error, setError] = useState<AppError | null>(null);

  const reload = useCallback(() => {
    if (!taskId) {
      setTask(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = getTask(taskId);
    setIsLoading(false);

    if (result.success) {
      setTask(result.data);
      setError(null);
      return;
    }

    setTask(null);
    setError(result.error);
  }, [taskId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { task, isLoading, error, reload };
}
