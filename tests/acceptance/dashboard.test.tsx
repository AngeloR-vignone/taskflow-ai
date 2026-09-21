import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { makeTask } from '../factories';
import type { Task } from '@/types/task';

const pendingTask = makeTask({
  id: 'task-pendiente',
  title: 'Preparar informe',
  category: 'Trabajo',
  priority: 'alta',
  status: 'pendiente',
});

const doneTask = makeTask({
  id: 'task-completada',
  title: 'Comprar café',
  category: 'Personal',
  priority: 'baja',
  status: 'completada',
});

interface FakeResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

function mockFetch(handler: (url: string, init?: RequestInit) => FakeResponse) {
  global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) =>
    Promise.resolve(handler(String(input), init)),
  ) as unknown as typeof fetch;
}

function jsonResponse(body: unknown, status = 200): FakeResponse {
  return { ok: status < 400, status, json: async () => body };
}

describe('Dashboard (pruebas de aceptación)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('muestra el contador de pendientes y la lista inicial', () => {
    mockFetch(() => jsonResponse({}));
    render(<Dashboard initialTasks={[pendingTask, doneTask]} userEmail="ana@taskflow.ai" />);

    expect(screen.getByText(/1 tarea pendiente/)).toBeInTheDocument();
    expect(screen.getByText('Preparar informe')).toBeInTheDocument();
    expect(screen.getByText('Comprar café')).toBeInTheDocument();
  });

  it('RF-02: crea una tarea desde el modal', async () => {
    const created: Task = makeTask({ id: 'nueva', title: 'Planificar sprint' });
    mockFetch(() => jsonResponse({ task: created }, 201));

    const user = userEvent.setup();
    render(<Dashboard initialTasks={[]} userEmail="ana@taskflow.ai" />);

    await user.click(screen.getByRole('button', { name: 'Nueva tarea' }));
    await user.type(screen.getByLabelText('Título'), 'Planificar sprint');
    await user.click(screen.getByRole('button', { name: 'Crear tarea' }));

    await waitFor(() => expect(screen.getByText('Planificar sprint')).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({ method: 'POST' }));
  });

  it('RF-05: marca una tarea como completada', async () => {
    mockFetch(() => jsonResponse({ task: { ...pendingTask, status: 'completada' } }));

    const user = userEvent.setup();
    render(<Dashboard initialTasks={[pendingTask]} userEmail="ana@taskflow.ai" />);

    await user.click(screen.getByRole('checkbox', { name: /Completar Preparar informe/ }));

    await waitFor(() => expect(screen.getByText(/0 tareas pendientes/)).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/tasks/${pendingTask.id}`,
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('RF-06: filtra por estado y por categoría', async () => {
    mockFetch(() => jsonResponse({}));
    const user = userEvent.setup();
    render(<Dashboard initialTasks={[pendingTask, doneTask]} userEmail="ana@taskflow.ai" />);

    await user.selectOptions(screen.getByLabelText('Estado'), 'completada');
    expect(screen.queryByText('Preparar informe')).not.toBeInTheDocument();
    expect(screen.getByText('Comprar café')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Estado'), 'todas');
    await user.selectOptions(screen.getByLabelText('Categoría'), 'Trabajo');
    expect(screen.getByText('Preparar informe')).toBeInTheDocument();
    expect(screen.queryByText('Comprar café')).not.toBeInTheDocument();
  });

  it('RF-07: genera y muestra el resumen de IA', async () => {
    mockFetch(() =>
      jsonResponse({
        summary: {
          pending_count: 1,
          overdue_count: 0,
          overview: 'Semana ligera.',
          suggested_priorities: [{ title: 'Preparar informe', reason: 'Prioridad alta' }],
          recommendation: 'Reserva la mañana del lunes.',
          generated_at: '2025-03-10T08:00:00.000Z',
        },
        message: null,
      }),
    );

    const user = userEvent.setup();
    render(<Dashboard initialTasks={[pendingTask]} userEmail="ana@taskflow.ai" />);

    await user.click(screen.getByRole('button', { name: 'Generar resumen' }));

    const dialog = await screen.findByRole('dialog', { name: 'Resumen semanal con IA' });
    await waitFor(() =>
      expect(within(dialog).getByText('Reserva la mañana del lunes.')).toBeInTheDocument(),
    );
    expect(within(dialog).getByText('Semana ligera.')).toBeInTheDocument();
  });

  it('RF-11: muestra el mensaje alternativo cuando no hay tareas', async () => {
    mockFetch(() => jsonResponse({ summary: null, message: 'No tienes tareas registradas.' }));

    const user = userEvent.setup();
    render(<Dashboard initialTasks={[]} userEmail="ana@taskflow.ai" />);

    await user.click(screen.getByRole('button', { name: 'Generar resumen' }));

    expect(await screen.findByText('No tienes tareas registradas.')).toBeInTheDocument();
  });
});
