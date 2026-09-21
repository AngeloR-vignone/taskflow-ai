'use client';

import { Label, Select } from '@/components/ui/Field';
import { TASK_STATUSES, type TaskFilters, type TaskStatus } from '@/types/task';

interface TaskFiltersBarProps {
  filters: TaskFilters;
  categories: readonly string[];
  onChange: (filters: TaskFilters) => void;
}

export function TaskFiltersBar({ filters, categories, onChange }: TaskFiltersBarProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md">
      <div>
        <Label htmlFor="filter-status">Estado</Label>
        <Select
          id="filter-status"
          value={filters.status}
          onChange={(event) =>
            onChange({ ...filters, status: event.target.value as TaskStatus | 'todas' })
          }
        >
          <option value="todas">Todos los estados</option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="filter-category">Categoría</Label>
        <Select
          id="filter-category"
          value={filters.category}
          onChange={(event) => onChange({ ...filters, category: event.target.value })}
        >
          <option value="todas">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
