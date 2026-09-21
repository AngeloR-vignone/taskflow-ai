# TaskFlow AI

Gestor de tareas personal con resumen semanal generado por IA. Permite registrar
tareas, organizarlas por prioridad y categoría, y recibir —bajo demanda o cada
lunes por correo— un análisis con tareas pendientes, vencidas, prioridades
sugeridas y una recomendación.

| Capa | Tecnología |
| --- | --- |
| Frontend | Next.js 15 (App Router), TypeScript strict, Tailwind CSS 4 |
| Backend | Route Handlers de Next.js + Supabase |
| Base de datos | PostgreSQL (Supabase) con Row Level Security |
| Autenticación | Supabase Auth (email + contraseña) |
| IA | OpenAI Chat Completions (JSON mode) |
| Automatización | n8n (schedule semanal → Supabase → OpenAI → SMTP) |
| Despliegue | Vercel |

## Instalación y ejecución local

Requisitos: Node.js 20+ y una cuenta de Supabase.

```bash
git clone https://github.com/<usuario>/taskflow-ai.git
cd taskflow-ai
npm install
cp .env.example .env.local
```

Ejecuta `supabase/schema.sql` en el SQL Editor de tu proyecto Supabase, completa
`.env.local` y arranca la app:

```bash
npm run dev        # http://localhost:3000
npm test           # pruebas unitarias, de integración y de aceptación
npm run lint       # ESLint
npm run typecheck  # TypeScript en modo strict
npm run build      # build de producción
```

## Variables de entorno

| Variable | Dónde | Descripción |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | app | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | app | Clave pública (anon) |
| `OPENAI_API_KEY` | app / n8n | Clave de OpenAI |
| `OPENAI_MODEL` | app / n8n | Modelo, por defecto `gpt-4o-mini` |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo n8n** | Lectura de la vista `weekly_digest` |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASSWORD` `SMTP_FROM` | **solo n8n** | Envío del correo semanal |

## Arquitectura

Diagramas Mermaid (arquitectura, ER y secuencia del resumen) y decisiones de
diseño: [`docs/architecture.md`](docs/architecture.md).

```
src/
  app/          # rutas App Router: login, register, dashboard y API
    api/tasks/  # CRUD (GET, POST, PATCH, DELETE)
    api/summary # generación del resumen con IA
  components/   # UI (ui/, tasks/, summary/, auth/, dashboard/)
  hooks/        # useTasks, useSummary
  lib/          # supabase/, tasks/ (dominio puro), ai/ (prompt + proveedor)
  types/        # Task, WeeklySummary, Database
supabase/schema.sql   # tabla, índices, políticas RLS y vista weekly_digest
n8n/workflow.json     # automatización semanal
tests/                # unit, integration, acceptance
```

## Base de datos y seguridad

La tabla `tasks` restringe `priority` a `alta | media | baja` y `status` a
`pendiente | completada` mediante `CHECK`. RLS está habilitado y forzado con
cuatro políticas (`select`, `insert`, `update`, `delete`) que exigen
`auth.uid() = user_id`: cada usuario solo puede ver y modificar sus tareas.

## Resumen con IA

El prompt (`src/lib/ai/prompt.ts`) recibe las tareas ya ordenadas por urgencia y
obliga al modelo a devolver JSON con `overview`, `suggested_priorities` (máx. 3) y
`recommendation`. Los contadores de pendientes y vencidas **se recalculan en el
servidor** a partir de la base de datos, de modo que las cifras del resumen nunca
dependen del modelo. Si el usuario no tiene tareas, no se llama a OpenAI y se
devuelve un mensaje alternativo (RF-11).

## Automatización semanal

`n8n/workflow.json` ejecuta cada lunes: Schedule Trigger → consulta a Supabase →
procesado de tareas → OpenAI → correo SMTP, con una rama alternativa para usuarios
sin tareas. Detalle en [`n8n/README.md`](n8n/README.md).

## Despliegue

Guía paso a paso (Supabase, Vercel y n8n) en
[`docs/deployment.md`](docs/deployment.md).

## Testing

```bash
npm test
```

- **Unitarias**: filtros, contadores, vencimientos, validación Zod, prompt y parseo
  de la respuesta de la IA.
- **Integración**: rutas `/api/tasks` y `/api/tasks/[id]` con Supabase simulado, y
  el caso de uso del resumen con un `SummaryGenerator` doble.
- **Aceptación**: el dashboard completo (crear, completar, filtrar, generar
  resumen y mensaje alternativo) con Testing Library.

## Requisitos cubiertos

| Requisito | Dónde |
| --- | --- |
| RF-01 registro e inicio de sesión | `src/components/auth/AuthForm.tsx`, `src/middleware.ts` |
| RF-02..RF-05 CRUD y completar | `src/app/api/tasks`, `src/components/tasks` |
| RF-06 filtros | `src/lib/tasks/filters.ts`, `TaskFiltersBar` |
| RF-07 botón Generar resumen | `Dashboard`, `POST /api/summary` |
| RF-08 resumen semanal automático | `n8n/workflow.json` |
| RF-09 análisis de la IA | `src/lib/ai/prompt.ts`, `summary-parser.ts` |
| RF-10 envío por correo | nodo `Enviar correo` (SMTP) |
| RF-11 mensaje alternativo | `summary-service.ts`, nodo `Mensaje alternativo` |
| RNF-01 < 2 s | índices en `schema.sql`, render en servidor, estado optimista |
| RNF-02 RLS | `supabase/schema.sql` |
| RNF-03 responsive | layout móvil-primero en todas las pantallas |
| RNF-04 Vercel | `docs/deployment.md` |
| RNF-05 sin intervención manual | schedule activo en n8n |
| RNF-06 historial de commits | commits por etapa (estructura, auth, CRUD, IA, n8n, tests, docs) |
