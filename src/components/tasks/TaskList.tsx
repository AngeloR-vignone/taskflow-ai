'use client';

import { TaskItem } from '@/components/tasks/TaskItem';
import type { Task } from '@/types/task';

interface TaskListProps {
  tasks: readonly Task[];
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskList({ tasks, onToggle, onEdit, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
        <p className="text-sm font-medium text-neutral-800">No hay tareas para este filtro</p>
        <p className="mt-1 text-sm text-muted">
          Crea una nueva tarea o ajusta los filtros de estado y categoría.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
