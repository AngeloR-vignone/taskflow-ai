'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TaskFiltersBar } from '@/components/tasks/TaskFiltersBar';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { TaskList } from '@/components/tasks/TaskList';
import { SummaryPanel } from '@/components/summary/SummaryPanel';
import { useSummary } from '@/hooks/useSummary';
import { useTasks } from '@/hooks/useTasks';
import { countPending, filterTasks, listCategories } from '@/lib/tasks/filters';
import { DEFAULT_FILTERS, type Task, type TaskFilters, type TaskInput } from '@/types/task';

interface DashboardProps {
  initialTasks: Task[];
  userEmail: string;
}

export function Dashboard({ initialTasks, userEmail }: DashboardProps) {
  const { tasks, error, isSaving, createTask, updateTask, deleteTask, toggleStatus } =
    useTasks(initialTasks);
  const summary = useSummary();

  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const visibleTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const categories = useMemo(() => listCategories(tasks), [tasks]);
  const pending = countPending(tasks);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setFormOpen(true);
  };

  const handleSubmit = (input: TaskInput) =>
    editing ? updateTask(editing.id, input) : createTask(input);

  const handleDelete = (task: Task) => {
    if (window.confirm(`¿Eliminar la tarea "${task.title}"?`)) {
      void deleteTask(task.id);
    }
  };

  const handleGenerateSummary = () => {
    setSummaryOpen(true);
    void summary.generate();
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">TaskFlow AI</h1>
          <p className="mt-1 text-sm text-muted">
            {pending} {pending === 1 ? 'tarea pendiente' : 'tareas pendientes'} · {userEmail}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleGenerateSummary}>
            Generar resumen
          </Button>
          <Button onClick={openCreate}>Nueva tarea</Button>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost">
              Salir
            </Button>
          </form>
        </div>
      </header>

      <section className="py-6">
        <TaskFiltersBar filters={filters} categories={categories} onChange={setFilters} />
      </section>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <TaskList
        tasks={visibleTasks}
        onToggle={(task) => void toggleStatus(task)}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <TaskFormModal
        open={formOpen}
        task={editing}
        isSaving={isSaving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <Modal
        open={summaryOpen}
        title="Resumen semanal con IA"
        onClose={() => {
          setSummaryOpen(false);
          summary.reset();
        }}
      >
        <SummaryPanel
          summary={summary.summary}
          message={summary.message}
          error={summary.error}
          isLoading={summary.isLoading}
        />
      </Modal>
    </div>
  );
}
