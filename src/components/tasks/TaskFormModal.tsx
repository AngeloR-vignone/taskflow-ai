'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea } from '@/components/ui/Field';
import { TASK_PRIORITIES, type Task, type TaskInput, type TaskPriority } from '@/types/task';

interface TaskFormModalProps {
  open: boolean;
  task?: Task | null;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (input: TaskInput) => Promise<unknown>;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  priority: 'media' as TaskPriority,
  due_date: '',
};

function toForm(task?: Task | null) {
  if (!task) return EMPTY_FORM;
  return {
    title: task.title,
    description: task.description ?? '',
    category: task.category ?? '',
    priority: task.priority,
    due_date: task.due_date ?? '',
  };
}

export function TaskFormModal({ open, task, isSaving, onClose, onSubmit }: TaskFormModalProps) {
  const [form, setForm] = useState(toForm(task));
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(toForm(task));
      setValidationError(null);
    }
  }, [open, task]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setValidationError('El título es obligatorio');
      return;
    }

    const input: TaskInput = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      priority: form.priority,
      due_date: form.due_date || null,
      status: task?.status ?? 'pendiente',
    };

    const result = await onSubmit(input);
    if (result) {
      onClose();
    }
  };

  return (
    <Modal open={open} title={task ? 'Editar tarea' : 'Nueva tarea'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Preparar informe semanal"
            autoFocus
          />
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Detalles, enlaces o criterios de finalización"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="category">Categoría</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              placeholder="Trabajo"
            />
          </div>
          <div>
            <Label htmlFor="priority">Prioridad</Label>
            <Select
              id="priority"
              value={form.priority}
              onChange={(event) =>
                setForm({ ...form, priority: event.target.value as TaskPriority })
              }
            >
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="due_date">Fecha límite</Label>
            <Input
              id="due_date"
              type="date"
              value={form.due_date}
              onChange={(event) => setForm({ ...form, due_date: event.target.value })}
            />
          </div>
        </div>

        {validationError ? <p className="text-sm text-red-600">{validationError}</p> : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando…' : task ? 'Guardar cambios' : 'Crear tarea'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
