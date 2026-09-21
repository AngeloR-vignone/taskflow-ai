# Guía de despliegue paso a paso

## 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) y anota la región.
2. **SQL Editor → New query**: pega el contenido de `supabase/schema.sql` y ejecútalo.
   Crea la tabla `tasks`, los índices, las políticas RLS y la vista `weekly_digest`.
3. **Authentication → Providers → Email**: deja habilitado *Email*.
   - Para probar sin buzón de correo, desactiva *Confirm email*.
   - En producción, mantenla activa y configura **Authentication → URL Configuration**
     con la URL de Vercel (`https://tu-app.vercel.app`) en *Site URL* y *Redirect URLs*.
4. **Project Settings → API**: copia `Project URL`, `anon public` y `service_role`.

Verifica RLS con el SQL Editor (debe devolver 0 filas, porque no hay sesión):

```sql
set role authenticated;
select count(*) from public.tasks;
reset role;
```

## 2. Repositorio

```bash
git clone https://github.com/<usuario>/taskflow-ai.git
cd taskflow-ai
npm install
cp .env.example .env.local   # completa las variables
npm run dev                  # http://localhost:3000
```

## 3. Vercel

1. **Add New → Project → Import Git Repository** y selecciona el repositorio.
2. Framework preset: **Next.js** (build `npm run build`, output automático).
3. **Environment Variables** (Production, Preview y Development):

   | Variable | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
   | `OPENAI_API_KEY` | clave de OpenAI |
   | `OPENAI_MODEL` | `gpt-4o-mini` (opcional) |

   No añadas la `service_role key` en Vercel: solo la usa n8n.
4. **Deploy**. Al terminar, copia la URL pública y añádela en Supabase
   (*Authentication → URL Configuration*).
5. Comprueba el despliegue: registro, login, crear tarea y **Generar resumen**.

## 4. n8n

Sigue `n8n/README.md`:

1. Importa `n8n/workflow.json`.
2. Define `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `SMTP_FROM`.
3. Crea la credencial SMTP `SMTP TaskFlow AI`.
4. Ejecuta el flujo manualmente y luego actívalo.

## 5. Checklist de verificación

- [ ] `npm run lint`, `npm run typecheck` y `npm test` en verde.
- [ ] Registro + login funcionando contra Supabase Auth.
- [ ] CRUD de tareas y filtros operativos en la URL pública.
- [ ] "Generar resumen" devuelve pendientes, vencidas, prioridades y recomendación.
- [ ] Un usuario sin tareas recibe el mensaje alternativo (RF-11).
- [ ] El workflow de n8n está activo y envió el correo de prueba.
- [ ] Dos cuentas distintas no ven las tareas de la otra (RLS).
