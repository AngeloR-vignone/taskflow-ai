import { z } from 'zod';
import type { Task } from '@/types/task';
import type { WeeklySummary } from '@/types/summary';
import { overdueTasks, pendingTasks } from '@/lib/tasks/stats';

const summaryResponseSchema = z.object({
  pending_count: z.number().int().min(0).optional(),
  overdue_count: z.number().int().min(0).optional(),
  overview: z.string().min(1),
  suggested_priorities: z
    .array(z.object({ title: z.string().min(1), reason: z.string().min(1) }))
    .max(3)
    .default([]),
  recommendation: z.string().min(1),
});

/**
 * Validates the model output and recomputes the counters locally, so the
 * numbers shown to the user always match the database.
 */
export function parseSummaryResponse(
  content: string | null | undefined,
  tasks: readonly Task[],
  reference: Date,
): Omit<WeeklySummary, 'generated_at'> {
  if (!content) {
    throw new Error('La IA no devolvió contenido');
  }

  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    throw new Error('La IA devolvió un JSON inválido');
  }

  const parsed = summaryResponseSchema.parse(raw);

  return {
    pending_count: pendingTasks(tasks).length,
    overdue_count: overdueTasks(tasks, reference).length,
    overview: parsed.overview,
    suggested_priorities: parsed.suggested_priorities,
    recommendation: parsed.recommendation,
  };
}
