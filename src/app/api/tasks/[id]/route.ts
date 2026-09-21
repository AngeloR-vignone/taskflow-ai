import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { taskUpdateSchema } from '@/lib/tasks/validation';
import { handleRouteError, jsonError } from '@/lib/http';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError('No autenticado', 401);
    }

    const payload = taskUpdateSchema.parse(await request.json());

    const { data, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      return jsonError(error.message, 400);
    }
    if (!data) {
      return jsonError('Tarea no encontrada', 404);
    }

    return NextResponse.json({ task: data });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError('No autenticado', 401);
    }

    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      return jsonError(error.message, 400);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
