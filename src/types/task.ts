export const TASK_PRIORITIES = ['alta', 'media', 'baja'] as const;
export const TASK_STATUSES = ['pendiente', 'completada'] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

// Declared as a type alias (not an interface) so it keeps an implicit index
// signature and satisfies the Supabase `GenericTable` constraint.
export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: TaskPriority;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
};

export type TaskInput = {
  title: string;
  description: string | null;
  category: string | null;
  priority: TaskPriority;
  due_date: string | null;
  status: TaskStatus;
};

export interface TaskFilters {
  status: TaskStatus | 'todas';
  category: string | 'todas';
}

export const DEFAULT_FILTERS: TaskFilters = { status: 'todas', category: 'todas' };
