import { buildWeeklySummary } from '@/lib/ai/summary-service';
import type { SummaryGenerator } from '@/lib/ai/summary-generator';
import { EMPTY_SUMMARY_MESSAGE } from '@/types/summary';
import { makeTask } from '../factories';

const REFERENCE = new Date('2025-03-10T08:00:00.000Z');

const generator: SummaryGenerator = {
  generate: jest.fn(async () => ({
    pending_count: 1,
    overdue_count: 1,
    overview: 'Una tarea vencida.',
    suggested_priorities: [{ title: 'Informe', reason: 'Venció ayer' }],
    recommendation: 'Bloquea una hora hoy.',
  })),
};

describe('caso de uso resumen semanal (RF-07, RF-09, RF-11)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devuelve el mensaje alternativo cuando no hay tareas', async () => {
    const result = await buildWeeklySummary([], generator, REFERENCE);

    expect(result).toEqual({ summary: null, message: EMPTY_SUMMARY_MESSAGE });
    expect(generator.generate).not.toHaveBeenCalled();
  });

  it('genera el resumen con las secciones requeridas', async () => {
    const tasks = [makeTask({ title: 'Informe', priority: 'alta', due_date: '2025-03-09' })];

    const { summary, message } = await buildWeeklySummary(tasks, generator, REFERENCE);

    expect(message).toBeNull();
    expect(generator.generate).toHaveBeenCalledWith(tasks, REFERENCE);
    expect(summary).toEqual({
      pending_count: 1,
      overdue_count: 1,
      overview: 'Una tarea vencida.',
      suggested_priorities: [{ title: 'Informe', reason: 'Venció ayer' }],
      recommendation: 'Bloquea una hora hoy.',
      generated_at: REFERENCE.toISOString(),
    });
  });
});
