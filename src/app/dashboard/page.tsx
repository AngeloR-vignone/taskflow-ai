import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { createClient } from '@/lib/supabase/server';
import type { Task } from '@/types/task';

export const metadata: Metadata = { title: 'Dashboard · TaskFlow AI' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  const tasks: Task[] = data ?? [];

  return <Dashboard initialTasks={tasks} userEmail={user.email ?? ''} />;
}
