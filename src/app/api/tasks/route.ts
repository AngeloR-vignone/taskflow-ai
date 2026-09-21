import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { taskInputSchema } from '@/lib/tasks/validation';
import { handleRouteError, jsonError } from '@/lib/http';

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError('No autenticado', 401);
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return jsonError(error.message, 400);
    }

    return NextResponse.json({ tasks: data ?? [] });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError('No autenticado', 401);
    }

    const payload = taskInputSchema.parse(await request.json());

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...payload, user_id: user.id })
      .select('*')
      .single();

    if (error) {
      return jsonError(error.message, 400);
    }

    return NextResponse.json({ task: data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
