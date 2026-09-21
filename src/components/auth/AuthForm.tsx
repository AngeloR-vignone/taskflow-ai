'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Field';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'register';

const COPY: Record<Mode, { title: string; subtitle: string; cta: string; alt: string; altHref: string; altLabel: string }> = {
  login: {
    title: 'Inicia sesión',
    subtitle: 'Organiza tus tareas y recibe tu resumen semanal con IA.',
    cta: 'Entrar',
    alt: '¿No tienes cuenta?',
    altHref: '/register',
    altLabel: 'Crear cuenta',
  },
  register: {
    title: 'Crea tu cuenta',
    subtitle: 'Empieza a planificar tu semana en menos de un minuto.',
    cta: 'Registrarme',
    alt: '¿Ya tienes cuenta?',
    altHref: '/login',
    altLabel: 'Iniciar sesión',
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const copy = COPY[mode];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setNotice(null);

    const supabase = createClient();

    if (mode === 'register') {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      setIsLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (!data.session) {
        setNotice('Revisa tu correo para confirmar la cuenta antes de iniciar sesión.');
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setIsLoading(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">TaskFlow AI</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
            {copy.title}
          </h1>
          <p className="mt-1 text-sm text-muted">{copy.subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-sm"
        >
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Procesando…' : copy.cta}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {copy.alt}{' '}
          <Link href={copy.altHref} className="font-medium text-neutral-900 underline">
            {copy.altLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
