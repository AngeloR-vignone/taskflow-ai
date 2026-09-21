import { countPending, filterTasks, listCategories } from '@/lib/tasks/filters';
import { makeTask } from '../factories';

describe('filtros de tareas (RF-06)', () => {
  const tasks = [
    makeTask({ id: '1', category: 'Trabajo', status: 'pendiente' }),
    makeTask({ id: '2', category: 'Personal', status: 'completada' }),
    makeTask({ id: '3', category: null, status: 'pendiente' }),
  ];

  it('filtra por estado', () => {
    const result = filterTasks(tasks, { status: 'pendiente', category: 'todas' });
    expect(result.map((task) => task.id)).toEqual(['1', '3']);
  });

  it('filtra por categoría', () => {
    const result = filterTasks(tasks, { status: 'todas', category: 'Personal' });
    expect(result.map((task) => task.id)).toEqual(['2']);
  });

  it('combina estado y categoría', () => {
    const result = filterTasks(tasks, { status: 'completada', category: 'Trabajo' });
    expect(result).toHaveLength(0);
  });

  it('agrupa las tareas sin categoría', () => {
    expect(listCategories(tasks)).toEqual(['Personal', 'Sin categoría', 'Trabajo']);
    expect(filterTasks(tasks, { status: 'todas', category: 'Sin categoría' })).toHaveLength(1);
  });

  it('cuenta las tareas pendientes', () => {
    expect(countPending(tasks)).toBe(2);
  });
});
