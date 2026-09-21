import { parseSummaryResponse } from '@/lib/ai/summary-parser';
import { makeTask } from '../factories';

const REFERENCE = new Date('2025-03-10T08:00:00.000Z');

const tasks = [
  makeTask({ id: 'a', due_date: '2025-03-01' }),
  makeTask({ id: 'b', status: 'completada' }),
  makeTask({ id: 'c', due_date: '2025-03-20' }),
];

const validResponse = JSON.stringify({
  pending_count: 99,
  overdue_count: 99,
  overview: 'Tienes trabajo atrasado.',
  suggested_priorities: [{ title: 'Tarea 1', reason: 'Está vencida' }],
  recommendation: 'Empieza por lo vencido.',
});

describe('parseo de la respuesta de la IA', () => {
  it('recalcula los contadores con los datos reales', () => {
    const summary = parseSummaryResponse(validResponse, tasks, REFERENCE);
    expect(summary.pending_count).toBe(2);
    expect(summary.overdue_count).toBe(1);
    expect(summary.recommendation).toBe('Empieza por lo vencido.');
  });

  it('falla con contenido vacío o JSON inválido', () => {
    expect(() => parseSummaryResponse(null, tasks, REFERENCE)).toThrow('no devolvió contenido');
    expect(() => parseSummaryResponse('no soy json', tasks, REFERENCE)).toThrow('JSON inválido');
  });

  it('falla si faltan campos obligatorios', () => {
    expect(() => parseSummaryResponse('{"overview":"x"}', tasks, REFERENCE)).toThrow();
  });
});
