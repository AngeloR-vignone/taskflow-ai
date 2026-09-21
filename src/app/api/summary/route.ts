import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildWeeklySummary } from '@/lib/ai/summary-service';
import { OpenAISummaryGenerator } from '@/lib/ai/openai-summary-generator';
import { handleRouteError, jsonError } from '@/lib/http';

export async function POST(): Promise<NextResponse> {
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
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) {
      return jsonError(error.message, 400);
    }

    const result = await buildWeeklySummary(data ?? [], new OpenAISummaryGenerator());

    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
