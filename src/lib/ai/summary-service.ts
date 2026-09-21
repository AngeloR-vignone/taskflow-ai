import type { Task } from '@/types/task';
import { EMPTY_SUMMARY_MESSAGE, type WeeklySummary } from '@/types/summary';
import type { SummaryGenerator } from '@/lib/ai/summary-generator';

export interface SummaryResult {
  summary: WeeklySummary | null;
  message: string | null;
}

/**
 * RF-07/RF-09/RF-11: builds the weekly summary, or the alternative message when
 * the user has no tasks at all.
 */
export async function buildWeeklySummary(
  tasks: readonly Task[],
  generator: SummaryGenerator,
  reference: Date = new Date(),
): Promise<SummaryResult> {
  if (tasks.length === 0) {
    return { summary: null, message: EMPTY_SUMMARY_MESSAGE };
  }

  const generated = await generator.generate(tasks, reference);

  return {
    summary: { ...generated, generated_at: reference.toISOString() },
    message: null,
  };
}
