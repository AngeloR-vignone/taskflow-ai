/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/tasks/route';
import { DELETE, PATCH } from '@/app/api/tasks/[id]/route';
import { createClient } from '@/lib/supabase/server';
import { makeTask } from '../factories';

jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));

const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>;

interface QueryResult {
  data: unknown;
  error: { message: string } | null;
}

interface QueryBuilderMock {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  single: jest.Mock;
  maybeSingle: jest.Mock;
  then: (resolve: (value: QueryResult) => unknown) => Promise<unknown>;
}

function buildSupabaseMock(user: { id: string } | null, result: QueryResult) {
  const builder: QueryBuilderMock = {
    select: jest.fn(() => builder),
    insert: jest.fn(() => builder),
    update: jest.fn(() => builder),
    delete: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    order: jest.fn(() => Promise.resolve(result)),
    single: jest.fn(() => Promise.resolve(result)),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
    then: (resolve: (value: QueryResult) => unknown) => Promise.resolve(result).then(resolve),
  };

  return {
    client: {
      auth: { getUser: jest.fn(async () => ({ data: { user } })) },
      from: jest.fn(() => builder),
    },
    builder,
  };
}

function jsonRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/tasks', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('API /api/tasks (RF-02..RF-05)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devuelve 401 cuando no hay sesión', async () => {
    const { client } = buildSupabaseMock(null, { data: null, error: null });
    mockedCreateClient.mockResolvedValue(client as never);

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it('lista las tareas del usuario autenticado', async () => {
    const tasks = [makeTask()];
    const { client, builder } = buildSupabaseMock({ id: 'user-1' }, { data: tasks, error: null });
    mockedCreateClient.mockResolvedValue(client as never);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ tasks });
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('crea una tarea asociándola al usuario de la sesión', async () => {
    const task = makeTask({ title: 'Nueva' });
    const { client, builder } = buildSupabaseMock({ id: 'user-1' }, { data: task, error: null });
    mockedCreateClient.mockResolvedValue(client as never);

    const response = await POST(jsonRequest({ title: 'Nueva', priority: 'alta' }));

    expect(response.status).toBe(201);
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nueva', priority: 'alta', user_id: 'user-1' }),
    );
  });

  it('rechaza payloads inválidos con 422', async () => {
    const { client } = buildSupabaseMock({ id: 'user-1' }, { data: null, error: null });
    mockedCreateClient.mockResolvedValue(client as never);

    const response = await POST(jsonRequest({ title: '' }));

    expect(response.status).toBe(422);
  });

  it('actualiza el estado de una tarea', async () => {
    const task = makeTask({ status: 'completada' });
    const { client, builder } = buildSupabaseMock({ id: 'user-1' }, { data: task, error: null });
    mockedCreateClient.mockResolvedValue(client as never);

    const response = await PATCH(jsonRequest({ status: 'completada' }), {
      params: Promise.resolve({ id: task.id }),
    });

    expect(response.status).toBe(200);
    expect(builder.update).toHaveBeenCalledWith({ status: 'completada' });
    expect(builder.eq).toHaveBeenCalledWith('id', task.id);
  });

  it('devuelve 404 si la tarea no pertenece al usuario (RLS)', async () => {
    const { client } = buildSupabaseMock({ id: 'user-1' }, { data: null, error: null });
    mockedCreateClient.mockResolvedValue(client as never);

    const response = await PATCH(jsonRequest({ status: 'completada' }), {
      params: Promise.resolve({ id: 'ajena' }),
    });

    expect(response.status).toBe(404);
  });

  it('elimina una tarea', async () => {
    const { client, builder } = buildSupabaseMock({ id: 'user-1' }, { data: null, error: null });
    mockedCreateClient.mockResolvedValue(client as never);

    const response = await DELETE(jsonRequest({}), { params: Promise.resolve({ id: 'task-1' }) });

    expect(response.status).toBe(204);
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('id', 'task-1');
  });
});
