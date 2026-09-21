import type { Task } from '@/types/task';

const PRIORITY_WEIGHT: Record<Task['priority'], number> = { alta: 0, media: 1, baja: 2 };

export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isOverdue(task: Task, reference: Date = new Date()): boolean {
  if (task.status === 'completada' || !task.due_date) {
    return false;
  }
  return task.due_date < toDateOnly(reference);
}

export function pendingTasks(tasks: readonly Task[]): Task[] {
  return tasks.filter((task) => task.status === 'pendiente');
}

export function overdueTasks(tasks: readonly Task[], reference: Date = new Date()): Task[] {
  return tasks.filter((task) => isOverdue(task, reference));
}

/**
 * Orders pending tasks by priority and then by the closest due date, so the AI
 * (and the UI) always receives the most urgent work first.
 */
export function rankByUrgency(tasks: readonly Task[]): Task[] {
  return [...pendingTasks(tasks)].sort((a, b) => {
    const byPriority = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    if (byPriority !== 0) {
      return byPriority;
    }
    if (a.due_date && b.due_date) {
      return a.due_date.localeCompare(b.due_date);
    }
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return a.created_at.localeCompare(b.created_at);
  });
}
