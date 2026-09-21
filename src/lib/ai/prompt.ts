import type { Task } from '@/types/task';
import { isOverdue, overdueTasks, pendingTasks, rankByUrgency, toDateOnly } from '@/lib/tasks/stats';

export const SUMMARY_SYSTEM_PROMPT = `Eres el asistente de productividad de TaskFlow AI.
Analizas la lista semanal de tareas de una persona y devuelves un resumen accionable en español neutro.

Reglas:
1. Usa únicamente los datos entregados; nunca inventes tareas, fechas ni categorías.
2. "pending_count" es el número de tareas con estado "pendiente".
3. "overdue_count" es el número de tareas pendientes cuya fecha límite ya pasó respecto a la fecha de referencia.
4. "suggested_priorities" contiene entre 1 y 3 tareas pendientes ordenadas por urgencia real (vencidas primero, luego prioridad alta y fecha límite cercana). Cada elemento usa el título exacto de la tarea y una razón de máximo 140 caracteres.
5. "recommendation" es un único consejo semanal concreto, de máximo 280 caracteres, enfocado en cómo distribuir el esfuerzo.
6. "overview" resume la situación en 2 frases como máximo.
7. Responde exclusivamente con JSON válido que cumpla el esquema indicado, sin markdown ni texto adicional.`;

export const SUMMARY_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['pending_count', 'overdue_count', 'overview', 'suggested_priorities', 'recommendation'],
  properties: {
    pending_count: { type: 'integer', minimum: 0 },
    overdue_count: { type: 'integer', minimum: 0 },
    overview: { type: 'string' },
    suggested_priorities: {
      type: 'array',
      minItems: 0,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'reason'],
        properties: { title: { type: 'string' }, reason: { type: 'string' } },
      },
    },
    recommendation: { type: 'string' },
  },
} as const;

export function buildSummaryUserPrompt(tasks: readonly Task[], reference: Date = new Date()): string {
  const payload = {
    reference_date: toDateOnly(reference),
    totals: {
      total: tasks.length,
      pending: pendingTasks(tasks).length,
      overdue: overdueTasks(tasks, reference).length,
    },
    tasks: rankByUrgency(tasks).map((task) => ({
      title: task.title,
      description: task.description,
      category: task.category ?? 'Sin categoría',
      priority: task.priority,
      due_date: task.due_date,
      status: task.status,
      overdue: isOverdue(task, reference),
    })),
  };

  return `Genera el resumen semanal con estos datos:\n${JSON.stringify(payload, null, 2)}`;
}
