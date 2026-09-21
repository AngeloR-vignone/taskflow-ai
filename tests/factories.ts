import type { Task } from '@/types/task';

let counter = 0;

export function makeTask(overrides: Partial<Task> = {}): Task {
  counter += 1;
  return {
    id: `task-${counter}`,
    user_id: 'user-1',
    title: `Tarea ${counter}`,
    description: null,
    category: 'Trabajo',
    priority: 'media',
    due_date: null,
    status: 'pendiente',
    created_at: '2025-01-01T10:00:00.000Z',
    ...overrides,
  };
}
