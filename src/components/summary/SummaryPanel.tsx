'use client';

import type { WeeklySummary } from '@/types/summary';

interface SummaryPanelProps {
  summary: WeeklySummary | null;
  message: string | null;
  error: string | null;
  isLoading: boolean;
}

function Metric({ label, value, tone }: { label: string; value: number; tone: 'neutral' | 'red' }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone === 'red' ? 'text-red-600' : 'text-neutral-900'}`}>
        {value}
      </p>
    </div>
  );
}

export function SummaryPanel({ summary, message, error, isLoading }: SummaryPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 text-sm text-muted">
        Analizando tus tareas con IA…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (message) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 text-sm text-muted">{message}</div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <section aria-label="Resumen generado" className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Pendientes" value={summary.pending_count} tone="neutral" />
        <Metric label="Vencidas" value={summary.overdue_count} tone="red" />
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="text-sm font-semibold text-neutral-900">Panorama</h3>
        <p className="mt-1 text-sm text-muted">{summary.overview}</p>
      </div>

      {summary.suggested_priorities.length > 0 ? (
        <div className="rounded-xl border border-line bg-surface p-5">
          <h3 className="text-sm font-semibold text-neutral-900">Prioridades sugeridas</h3>
          <ol className="mt-2 space-y-2">
            {summary.suggested_priorities.map((item, index) => (
              <li key={`${item.title}-${index}`} className="text-sm">
                <span className="font-medium text-neutral-900">{item.title}</span>
                <span className="block text-muted">{item.reason}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="text-sm font-semibold text-neutral-900">Recomendación semanal</h3>
        <p className="mt-1 text-sm text-muted">{summary.recommendation}</p>
      </div>

      <p className="text-xs text-muted">
        Generado el {new Date(summary.generated_at).toLocaleString('es')}
      </p>
    </section>
  );
}
