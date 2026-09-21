# Arquitectura · TaskFlow AI

## Diagrama de arquitectura

```mermaid
flowchart TB
  subgraph Cliente
    B[Navegador<br/>Next.js 15 App Router + Tailwind]
  end

  subgraph Vercel
    SSR[Server Components<br/>/dashboard]
    MW[Middleware<br/>refresco de sesión y guardas]
    API[Route Handlers<br/>/api/tasks · /api/summary]
  end

  subgraph Supabase
    AUTH[(Supabase Auth)]
    DB[(PostgreSQL<br/>tabla tasks + RLS)]
    VIEW[[Vista weekly_digest]]
  end

  OPENAI[OpenAI API<br/>chat/completions]
  N8N[n8n<br/>Schedule semanal]
  SMTP[(SMTP)]

  B --> MW --> SSR
  B --> API
  SSR --> DB
  API --> DB
  B -- signUp / signInWithPassword --> AUTH
  MW --> AUTH
  API --> OPENAI
  N8N --> VIEW
  VIEW --> DB
  N8N --> OPENAI
  N8N --> SMTP --> B
```

## Diagrama entidad-relación

```mermaid
erDiagram
  AUTH_USERS ||--o{ TASKS : "posee"

  AUTH_USERS {
    uuid id PK
    text email
    timestamptz created_at
  }

  TASKS {
    uuid id PK
    uuid user_id FK
    text title
    text description
    text category
    text priority "alta | media | baja"
    date due_date
    text status "pendiente | completada"
    timestamptz created_at
  }
```

## Capas y responsabilidades

| Capa | Ubicación | Responsabilidad |
| --- | --- | --- |
| Presentación | `src/app`, `src/components` | Pantallas, modales y estado de UI. Sin lógica de negocio. |
| Estado de cliente | `src/hooks` | `useTasks` y `useSummary` encapsulan las llamadas HTTP y el estado. |
| Aplicación | `src/app/api`, `src/lib/ai/summary-service.ts` | Autenticación de la petición, validación y orquestación del caso de uso. |
| Dominio | `src/lib/tasks`, `src/lib/ai/prompt.ts` | Funciones puras: filtros, contadores, vencimientos, prompt. 100 % testeables. |
| Infraestructura | `src/lib/supabase`, `src/lib/ai/openai-summary-generator.ts` | Clientes de Supabase y OpenAI. |

### Decisiones de diseño

- **Inversión de dependencias**: el caso de uso depende de la interfaz
  `SummaryGenerator`, no de OpenAI. Los tests inyectan un doble determinista y
  cambiar de proveedor solo requiere una nueva implementación.
- **Los contadores no los decide la IA**: `pending_count` y `overdue_count` se
  recalculan en `summary-parser.ts` a partir de la base de datos, para que el
  resumen nunca muestre números inventados.
- **Seguridad en la base de datos**: todas las consultas usan la `anon key` con la
  sesión del usuario, por lo que RLS es la última línea de defensa incluso si una
  ruta de API tuviera un fallo.
- **Rendimiento (RNF-01)**: índices por `user_id`, `status`, `category` y
  `due_date`; el dashboard se renderiza en el servidor con los datos ya cargados y
  las mutaciones actualizan el estado local sin recargar la lista completa.

## Flujo de datos del resumen (RF-07 / RF-09)

```mermaid
sequenceDiagram
  actor U as Usuario
  participant D as Dashboard
  participant A as POST /api/summary
  participant S as Supabase
  participant O as OpenAI

  U->>D: Clic en "Generar resumen"
  D->>A: POST /api/summary
  A->>S: auth.getUser() + select tasks (RLS)
  alt Sin tareas
    A-->>D: { summary: null, message } (RF-11)
  else Con tareas
    A->>O: chat/completions (JSON mode)
    O-->>A: JSON del resumen
    A->>A: valida y recalcula contadores
    A-->>D: { summary }
  end
  D-->>U: Modal con pendientes, vencidas, prioridades y recomendación
```
