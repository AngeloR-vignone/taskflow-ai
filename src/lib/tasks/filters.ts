import type { Task, TaskFilters } from '@/types/task';

export function filterTasks(tasks: readonly Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    const matchesStatus = filters.status === 'todas' || task.status === filters.status;
    const matchesCategory =
      filters.category === 'todas' || (task.category ?? 'Sin categoría') === filters.category;
    return matchesStatus && matchesCategory;
  });
}

export function listCategories(tasks: readonly Task[]): string[] {
  const categories = new Set<string>();
  tasks.forEach((task) => categories.add(task.category ?? 'Sin categoría'));
  return [...categories].sort((a, b) => a.localeCompare(b, 'es'));
}

export function countPending(tasks: readonly Task[]): number {
  return tasks.filter((task) => task.status === 'pendiente').length;
}
