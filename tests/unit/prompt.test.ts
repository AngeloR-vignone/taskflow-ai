import { buildSummaryUserPrompt } from '@/lib/ai/prompt';
import { makeTask } from '../factories';

const REFERENCE = new Date('2025-03-10T08:00:00.000Z');

describe('prompt del resumen semanal', () => {
  it('incluye la fecha de referencia, los totales y el orden por urgencia', () => {
    const prompt = buildSummaryUserPrompt(
      [
        makeTask({ title: 'Baja', priority: 'baja' }),
        makeTask({ title: 'Vencida', priority: 'alta', due_date: '2025-03-01' }),
      ],
      REFERENCE,
    );

    const payload = JSON.parse(prompt.slice(prompt.indexOf('{')));

    expect(payload.reference_date).toBe('2025-03-10');
    expect(payload.totals).toEqual({ total: 2, pending: 2, overdue: 1 });
    expect(payload.tasks[0]).toMatchObject({ title: 'Vencida', overdue: true });
    expect(payload.tasks[1]).toMatchObject({ title: 'Baja', overdue: false });
  });
});
