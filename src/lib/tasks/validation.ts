import { z } from 'zod';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/types/task';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha límite debe tener formato YYYY-MM-DD');

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value ? value : null));

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(140),
  description: nullableText(2000),
  category: nullableText(60),
  priority: z.enum(TASK_PRIORITIES).default('media'),
  due_date: isoDate.nullish().transform((value) => value ?? null),
  status: z.enum(TASK_STATUSES).default('pendiente'),
});

export const taskUpdateSchema = taskInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Debes enviar al menos un campo para actualizar',
);

export type TaskInputSchema = z.infer<typeof taskInputSchema>;
export type TaskUpdateSchema = z.infer<typeof taskUpdateSchema>;
