-- TaskFlow AI · esquema de base de datos (PostgreSQL / Supabase)
-- Ejecutar en Supabase Studio › SQL Editor o con `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tabla principal
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null check (char_length(trim(title)) > 0),
  description text,
  category    text,
  priority    text not null default 'media' check (priority in ('alta', 'media', 'baja')),
  due_date    date,
  status      text not null default 'pendiente' check (status in ('pendiente', 'completada')),
  created_at  timestamptz not null default now()
);

comment on table public.tasks is 'Tareas personales de cada usuario de TaskFlow AI';

-- ---------------------------------------------------------------------------
-- Índices (RNF-01: respuesta < 2s)
-- ---------------------------------------------------------------------------
create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_user_status_idx on public.tasks (user_id, status);
create index if not exists tasks_user_due_date_idx on public.tasks (user_id, due_date);
create index if not exists tasks_user_category_idx on public.tasks (user_id, category);

-- ---------------------------------------------------------------------------
-- RNF-02: Row Level Security
-- ---------------------------------------------------------------------------
alter table public.tasks enable row level security;
alter table public.tasks force row level security;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
  on public.tasks for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
  on public.tasks for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
  on public.tasks for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
  on public.tasks for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RF-08 / RF-11: vista consumida por n8n con el service role.
-- Devuelve UNA fila por usuario (incluidos los que no tienen tareas) con las
-- tareas relevantes de la semana agregadas en JSON.
-- ---------------------------------------------------------------------------
create or replace view public.weekly_digest
with (security_invoker = true) as
select
  u.id as user_id,
  u.email,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'title', t.title,
        'description', t.description,
        'category', t.category,
        'priority', t.priority,
        'due_date', t.due_date,
        'status', t.status,
        'created_at', t.created_at
      )
      order by t.due_date nulls last, t.created_at
    ) filter (where t.id is not null),
    '[]'::jsonb
  ) as tasks
from auth.users u
left join public.tasks t
  on t.user_id = u.id
 and (t.status = 'pendiente' or t.created_at >= now() - interval '7 days')
group by u.id, u.email;

revoke all on public.weekly_digest from anon, authenticated;
