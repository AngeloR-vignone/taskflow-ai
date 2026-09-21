'use client';

import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { isOverdue } from '@/lib/tasks/stats';
import type { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const completed = task.status === 'completada';
  const overdue = isOverdue(task);

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <input
          type="checkbox"
          checked={completed}
          onChange={() => onToggle(task)}
          aria-label={completed ? `Marcar ${task.title} como pendiente` : `Completar ${task.title}`}
          className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 accent-neutral-900"
        />
        <div className="min-w-0">
          <p
            className={`truncate text-sm font-medium ${completed ? 'text-muted line-through' : 'text-neutral-900'}`}
          >
            {task.title}
          </p>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted">{task.description}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <PriorityBadge priority={task.priority} />
            <span className="rounded-full bg-neutral-100 px-2 py-0.5">
              {task.category ?? 'Sin categoría'}
            </span>
            {task.due_date ? (
              <span className={overdue ? 'font-medium text-red-600' : undefined}>
                {overdue ? 'Vencida el ' : 'Vence el '}
                {task.due_date}
              </span>
            ) : (
              <span>Sin fecha límite</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 self-end sm:self-start">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded-md px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}
