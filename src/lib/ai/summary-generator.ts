import type { Task } from '@/types/task';
import type { WeeklySummary } from '@/types/summary';

/**
 * Abstraction over the model provider so the summary use case does not depend
 * on OpenAI (Dependency Inversion). Tests inject a deterministic double.
 */
export interface SummaryGenerator {
  generate(tasks: readonly Task[], reference: Date): Promise<Omit<WeeklySummary, 'generated_at'>>;
}
