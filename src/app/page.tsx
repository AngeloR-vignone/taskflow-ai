"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Status = "todo" | "doing" | "done";
type Task = { id: string; title: string; description: string; status: Status; priority: "low" | "medium" | "high"; project: string; due: string; createdAt: string };
type Project = { id: string; name: string; color: string };

const seedProjects: Project[] = [{ id: "personal", name: "Personal", color: "#7c3aed" }, { id: "work", name: "Trabajo", color: "#0891b2" }];
const seedTasks: Task[] = [
  { id: "1", title: "Planificar la semana", description: "Definir objetivos y prioridades para los próximos días.", status: "doing", priority: "high", project: "personal", due: "", createdAt: new Date().toISOString() },
  { id: "2", title: "Revisar documentación del proyecto", description: "Actualizar el README y los pasos de instalación.", status: "todo", priority: "medium", project: "work", due: "", createdAt: new Date().toISOString() },
  { id: "3", title: "Celebrar los avances", description: "Tomar un descanso y reconocer el trabajo hecho.", status: "done", priority: "low", project: "personal", due: "", createdAt: new Date().toISOString() },
];

const labels: Record<Status, string> = { todo: "Por hacer", doing: "En progreso", done: "Completadas" };
const nextStatus: Record<Status, Status> = { todo: "doing", doing: "done", done: "todo" };

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [activeProject, setActiveProject] = useState("all");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState("Alex Rivera");
  const [toast, setToast] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => { const saved = localStorage.getItem("taskflow-data"); if (saved) { const data = JSON.parse(saved); setTasks(data.tasks); setProjects(data.projects); setUser(data.user || "Alex Rivera"); } }, []);
  useEffect(() => { localStorage.setItem("taskflow-data", JSON.stringify({ tasks, projects, user })); }, [tasks, projects, user]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 2600); return () => clearTimeout(timer); }, [toast]);

  const visibleTasks = useMemo(() => tasks.filter(t => (activeProject === "all" || t.project === activeProject) && (filter === "all" || t.status === filter) && `${t.title} ${t.description}`.toLowerCase().includes(query.toLowerCase())), [tasks, activeProject, filter, query]);
  const counts = { all: tasks.length, todo: tasks.filter(t => t.status === "todo").length, doing: tasks.filter(t => t.status === "doing").length, done: tasks.filter(t => t.status === "done").length };
  const columns: Status[] = ["todo", "doing", "done"];

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const title = String(form.get("title") || "").trim(); if (!title) return;
    const task: Task = { id: editing?.id || crypto.randomUUID(), title, description: String(form.get("description") || ""), status: (form.get("status") as Status) || "todo", priority: (form.get("priority") as Task["priority"]) || "medium", project: String(form.get("project") || projects[0]?.id), due: String(form.get("due") || ""), createdAt: editing?.createdAt || new Date().toISOString() };
    setTasks(current => editing ? current.map(item => item.id === editing.id ? task : item) : [task, ...current]); setModal(false); setEditing(null); setToast(editing ? "Tarea actualizada" : "Tarea creada");
  }
  function removeTask(id: string) { setTasks(current => current.filter(t => t.id !== id)); setToast("Tarea eliminada"); }
  function moveTask(task: Task) { const status = nextStatus[task.status]; setTasks(current => current.map(t => t.id === task.id ? { ...t, status } : t)); }
  function addProject() { const name = prompt("Nombre del nuevo proyecto:"); if (name?.trim()) { const project = { id: crypto.randomUUID(), name: name.trim(), color: "#f97316" }; setProjects(p => [...p, project]); setActiveProject(project.id); setToast("Proyecto creado"); } }
  function suggestTask() { const title = prompt("¿Qué objetivo quieres convertir en tareas?"); if (!title?.trim()) return; const pieces = [`Investigar y definir: ${title}`, `Ejecutar la primera parte de: ${title}`, `Revisar y completar: ${title}`]; setTasks(current => [...pieces.reverse().map((name, index) => ({ id: crypto.randomUUID(), title: name, description: "Sugerencia generada por TaskFlow AI. Divide el trabajo en pasos pequeños y accionables.", status: "todo" as Status, priority: index === 2 ? "high" as const : "medium" as const, project: activeProject === "all" ? projects[0].id : activeProject, due: "", createdAt: new Date().toISOString() })), ...current]); setToast("La IA creó 3 tareas sugeridas"); }
  function exportTasks() { const blob = new Blob([JSON.stringify({ tasks, projects }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "taskflow-backup.json"; a.click(); URL.revokeObjectURL(url); }

  return <main className={dark ? "app dark" : "app"}>
    <aside className="sidebar"><div className="brand"><span className="brand-mark">✦</span><span>Task<span>Flow</span></span></div><div className="workspace"><span className="avatar">{user[0]}</span><div><b>{user}</b><small>Espacio personal</small></div><button className="icon-button" onClick={() => setProfileOpen(!profileOpen)}>⌄</button></div>
      {profileOpen && <div className="profile-card"><b>Cuenta demo</b><button onClick={() => { const name = prompt("Tu nombre:", user); if (name) setUser(name); }}>Editar perfil</button><button onClick={() => setToast("La sesión demo está activa")}>Cerrar sesión</button></div>}
      <nav><p className="nav-title">MENÚ</p><button className={activeProject === "all" ? "nav-item active" : "nav-item"} onClick={() => { setActiveProject("all"); setFilter("all"); }}><span>▦</span> Todas las tareas <em>{counts.all}</em></button><button className={filter === "doing" ? "nav-item active" : "nav-item"} onClick={() => setFilter("doing")}><span>◷</span> En progreso <em>{counts.doing}</em></button><button className={filter === "done" ? "nav-item active" : "nav-item"} onClick={() => setFilter("done")}><span>✓</span> Completadas <em>{counts.done}</em></button><p className="nav-title projects-title">PROYECTOS <button onClick={addProject}>＋</button></p>{projects.map(project => <button key={project.id} className={activeProject === project.id ? "nav-item active" : "nav-item"} onClick={() => { setActiveProject(project.id); setFilter("all"); }}><i style={{ background: project.color }} />{project.name}<em>{tasks.filter(t => t.project === project.id && t.status !== "done").length}</em></button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item" onClick={exportTasks}>⇩ Exportar datos</button><button className="nav-item" onClick={() => setDark(!dark)}>{dark ? "☀" : "☾"} Cambiar apariencia</button></div>
    </aside>
    <section className="content"><header><div><p className="eyebrow">{new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p><h1>{activeProject === "all" ? "Mi tablero" : projects.find(p => p.id === activeProject)?.name}</h1><p className="subtitle">Organiza tu trabajo y consigue tus objetivos.</p></div><div className="header-actions"><label className="search">⌕<input placeholder="Buscar tareas..." value={query} onChange={e => setQuery(e.target.value)} /><kbd>⌘ K</kbd></label><button className="notification">♧<span /></button><button className="avatar header-avatar" onClick={() => setProfileOpen(!profileOpen)}>{user[0]}</button></div></header>
      <div className="toolbar"><div className="tabs"><button className={filter === "all" ? "tab selected" : "tab"} onClick={() => setFilter("all")}>Todas <b>{counts.all}</b></button><button className={filter === "todo" ? "tab selected" : "tab"} onClick={() => setFilter("todo")}>Por hacer <b>{counts.todo}</b></button><button className={filter === "doing" ? "tab selected" : "tab"} onClick={() => setFilter("doing")}>En progreso <b>{counts.doing}</b></button><button className={filter === "done" ? "tab selected" : "tab"} onClick={() => setFilter("done")}>Completadas <b>{counts.done}</b></button></div><div className="actions"><button className="ai-button" onClick={suggestTask}>✦ Crear con IA</button><button className="primary" onClick={() => { setEditing(null); setModal(true); }}>＋ Nueva tarea</button></div></div>
      <div className="stats"><div><span className="stat-icon purple">▦</span><div><small>Total de tareas</small><strong>{counts.all}</strong></div></div><div><span className="stat-icon orange">◷</span><div><small>En progreso</small><strong>{counts.doing}</strong></div></div><div><span className="stat-icon green">✓</span><div><small>Completadas</small><strong>{counts.done}</strong></div></div><div className="progress-stat"><div><small>Progreso semanal</small><strong>{counts.all ? Math.round(counts.done / counts.all * 100) : 0}%</strong></div><div className="progress"><i style={{ width: `${counts.all ? counts.done / counts.all * 100 : 0}%` }} /></div></div></div>
      <div className="board">{columns.map(status => <div className="column" key={status}><div className="column-title"><span className={`dot ${status}`} /><h2>{labels[status]}</h2><b>{visibleTasks.filter(t => t.status === status).length}</b><button onClick={() => { setEditing(null); setModal(true); }}>＋</button></div>{visibleTasks.filter(t => t.status === status).map(task => <article className="task-card" key={task.id}><div className="task-top"><span className={`priority ${task.priority}`}>{task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}</span><button className="more" onClick={() => { setEditing(task); setModal(true); }}>•••</button></div><h3>{task.title}</h3><p>{task.description}</p><div className="task-footer"><span className="project-label"><i style={{ background: projects.find(p => p.id === task.project)?.color }} />{projects.find(p => p.id === task.project)?.name}</span>{task.due && <span>◷ {task.due}</span>}<button className="advance" onClick={() => moveTask(task)} title="Cambiar estado">{status === "done" ? "↶" : "→"}</button><button className="delete" onClick={() => removeTask(task.id)}>×</button></div></article>)}{visibleTasks.filter(t => t.status === status).length === 0 && <div className="empty">No hay tareas aquí</div>}</div>)}</div>
    </section>
    {modal && <div className="modal-backdrop" onClick={() => setModal(false)}><form className="modal" onSubmit={saveTask} onClick={e => e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">TASKFLOW</p><h2>{editing ? "Editar tarea" : "Nueva tarea"}</h2></div><button type="button" onClick={() => setModal(false)}>×</button></div><label>Título<input name="title" required defaultValue={editing?.title} placeholder="¿Qué necesitas hacer?" autoFocus /></label><label>Descripción<textarea name="description" defaultValue={editing?.description} placeholder="Añade contexto o notas..." /></label><div className="form-grid"><label>Estado<select name="status" defaultValue={editing?.status || "todo"}><option value="todo">Por hacer</option><option value="doing">En progreso</option><option value="done">Completada</option></select></label><label>Prioridad<select name="priority" defaultValue={editing?.priority || "medium"}><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option></select></label></div><div className="form-grid"><label>Proyecto<select name="project" defaultValue={editing?.project || projects[0]?.id}>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Fecha límite<input type="date" name="due" defaultValue={editing?.due} /></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(false)}>Cancelar</button><button className="primary" type="submit">{editing ? "Guardar cambios" : "Crear tarea"}</button></div></form></div>}
    {toast && <div className="toast">✓ {toast}</div>}
  </main>;
}
