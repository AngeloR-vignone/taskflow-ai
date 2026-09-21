export interface SummaryPriorityItem {
  title: string;
  reason: string;
}

export interface WeeklySummary {
  pending_count: number;
  overdue_count: number;
  overview: string;
  suggested_priorities: SummaryPriorityItem[];
  recommendation: string;
  generated_at: string;
}

export const EMPTY_SUMMARY_MESSAGE =
  'No tienes tareas registradas esta semana. Crea tu primera tarea para recibir un resumen con prioridades y recomendaciones.';
