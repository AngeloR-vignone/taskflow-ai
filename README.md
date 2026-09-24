# TaskFlow AI

Aplicación de gestión de tareas construida con Next.js, React y TypeScript.

## Funciones incluidas

- Tablero Kanban con tareas por hacer, en progreso y completadas.
- Crear, editar, eliminar y avanzar tareas entre estados.
- Prioridades, fechas límite, descripciones y proyectos.
- Filtros por estado, proyectos y búsqueda de texto.
- Asistente de IA local para dividir un objetivo en tareas accionables.
- Perfil demo y cambio de nombre de usuario.
- Persistencia automática en `localStorage`.
- Exportación de tareas y proyectos a JSON.
- Modo claro/oscuro y diseño responsive.

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

> La autenticación y la base de datos todavía funcionan como una experiencia demo local. Para producción hay que conectar un proveedor como Supabase, Clerk o Auth.js y una base de datos.
