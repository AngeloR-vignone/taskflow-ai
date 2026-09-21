import { isOverdue, overdueTasks, pendingTasks, rankByUrgency } from '@/lib/tasks/stats';
import { makeTask } from '../factories';

const REFERENCE = new Date('2025-03-10T08:00:00.000Z');

describe('estadísticas de tareas', () => {
  it('marca como vencida una tarea pendiente con fecha pasada', () => {
    expect(isOverdue(makeTask({ due_date: '2025-03-09' }), REFERENCE)).toBe(true);
  });

  it('no marca como vencida una tarea completada ni una sin fecha', () => {
    expect(isOverdue(makeTask({ due_date: '2025-03-01', status: 'completada' }), REFERENCE)).toBe(
      false,
    );
    expect(isOverdue(makeTask({ due_date: null }), REFERENCE)).toBe(false);
    expect(isOverdue(makeTask({ due_date: '2025-03-10' }), REFERENCE)).toBe(false);
  });

  it('separa pendientes y vencidas', () => {
    const tasks = [
      makeTask({ id: 'a', due_date: '2025-03-01' }),
      makeTask({ id: 'b', status: 'completada' }),
      makeTask({ id: 'c', due_date: '2025-03-20' }),
    ];
    expect(pendingTasks(tasks).map((task) => task.id)).toEqual(['a', 'c']);
    expect(overdueTasks(tasks, REFERENCE).map((task) => task.id)).toEqual(['a']);
  });

  it('ordena por prioridad y luego por fecha límite', () => {
    const tasks = [
      makeTask({ id: 'baja', priority: 'baja', due_date: '2025-03-11' }),
      makeTask({ id: 'alta-tarde', priority: 'alta', due_date: '2025-03-15' }),
      makeTask({ id: 'alta-pronto', priority: 'alta', due_date: '2025-03-11' }),
      makeTask({ id: 'media-sin-fecha', priority: 'media', due_date: null }),
      makeTask({ id: 'completada', priority: 'alta', status: 'completada' }),
    ];

    expect(rankByUrgency(tasks).map((task) => task.id)).toEqual([
      'alta-pronto',
      'alta-tarde',
      'media-sin-fecha',
      'baja',
    ]);
  });
});
