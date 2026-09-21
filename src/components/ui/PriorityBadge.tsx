import type { TaskPriority } from '@/types/task';

const STYLES: Record<TaskPriority, string> = {
  alta: 'bg-red-50 text-red-700 ring-red-200',
  media: 'bg-amber-50 text-amber-700 ring-amber-200',
  baja: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}
