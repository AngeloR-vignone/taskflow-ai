import { taskInputSchema, taskUpdateSchema } from '@/lib/tasks/validation';

describe('validación de tareas (RF-02)', () => {
  it('aplica valores por defecto y normaliza campos vacíos', () => {
    const parsed = taskInputSchema.parse({ title: '  Escribir informe  ', description: '' });

    expect(parsed).toEqual({
      title: 'Escribir informe',
      description: null,
      category: null,
      priority: 'media',
      due_date: null,
      status: 'pendiente',
    });
  });

  it('rechaza títulos vacíos', () => {
    expect(() => taskInputSchema.parse({ title: '   ' })).toThrow();
  });

  it('rechaza prioridades y estados fuera del catálogo', () => {
    expect(() => taskInputSchema.parse({ title: 'x', priority: 'urgente' })).toThrow();
    expect(() => taskInputSchema.parse({ title: 'x', status: 'archivada' })).toThrow();
  });

  it('rechaza fechas con formato inválido', () => {
    expect(() => taskInputSchema.parse({ title: 'x', due_date: '10/03/2025' })).toThrow();
  });

  it('exige al menos un campo en las actualizaciones', () => {
    expect(() => taskUpdateSchema.parse({})).toThrow();
    expect(taskUpdateSchema.parse({ status: 'completada' })).toEqual({ status: 'completada' });
  });
});
