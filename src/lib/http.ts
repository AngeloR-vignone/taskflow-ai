import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Datos inválidos', issues: error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const message = error instanceof Error ? error.message : 'Error inesperado';
  return jsonError(message, 500);
}
