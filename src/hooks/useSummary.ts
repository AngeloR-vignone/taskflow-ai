'use client';

import { useCallback, useState } from 'react';
import type { WeeklySummary } from '@/types/summary';

interface SummaryResponse {
  summary: WeeklySummary | null;
  message: string | null;
  error?: string;
}

export function useSummary() {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/summary', { method: 'POST' });
      const body = (await response.json()) as SummaryResponse;
      if (!response.ok) {
        throw new Error(body.error ?? 'No se pudo generar el resumen');
      }
      setSummary(body.summary);
      setMessage(body.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error inesperado');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSummary(null);
    setMessage(null);
    setError(null);
  }, []);

  return { summary, message, error, isLoading, generate, reset };
}
