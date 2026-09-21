'use client';

import { useCallback, useMemo, useState } from 'react';
import type { Task, TaskInput } from '@/types/task';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? 'No se pudo completar la operación');
  }
  return body;
}

export function useTasks(initialTasks: readonly Task[]) {
  const [tasks, setTasks] = useState<Task[]>([...initialTasks]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const run = useCallback(async <T>(operation: () => Promise<T>): Promise<T | null> => {
    setIsSaving(true);
    setError(null);
    try {
      return await operation();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error inesperado');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const createTask = useCallback(
    (input: TaskInput) =>
      run(async () => {
        const { task } = await request<{ task: Task }>('/api/tasks', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        setTasks((current) => [task, ...current]);
        return task;
      }),
    [run],
  );

  const updateTask = useCallback(
    (id: string, input: Partial<TaskInput>) =>
      run(async () => {
        const { task } = await request<{ task: Task }>(`/api/tasks/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(input),
        });
        setTasks((current) => current.map((item) => (item.id === id ? task : item)));
        return task;
      }),
    [run],
  );

  const deleteTask = useCallback(
    (id: string) =>
      run(async () => {
        await request<void>(`/api/tasks/${id}`, { method: 'DELETE' });
        setTasks((current) => current.filter((item) => item.id !== id));
        return true;
      }),
    [run],
  );

  const toggleStatus = useCallback(
    (task: Task) =>
      updateTask(task.id, { status: task.status === 'pendiente' ? 'completada' : 'pendiente' }),
    [updateTask],
  );

  return useMemo(
    () => ({ tasks, error, isSaving, createTask, updateTask, deleteTask, toggleStatus }),
    [tasks, error, isSaving, createTask, updateTask, deleteTask, toggleStatus],
  );
}
