import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getUsers, getCourses, getTasks } from '@/app/actions/tasks';
import { Header } from '@/app/components/Header';
import { GanttChart } from '@/app/components/GanttChart';
import { Dashboard } from '@/app/components/Dashboard';
import { TaskList } from '@/app/components/TaskList';
import { cookies } from 'next/headers';
import { LoginForm } from '@/app/components/LoginForm';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ user?: string; tab?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const [users, courses] = await Promise.all([getUsers(), getCourses()]);

  if (users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Acceso Restringido</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Por seguridad, esta aplicación es privada. Para habilitar las cuentas de <strong>Raul</strong> y <strong>Miguel</strong>, ejecuta este código en el SQL Editor de Supabase:
          </p>
          <div className="text-left bg-slate-900 rounded-xl p-4 overflow-x-auto relative group">
            <code className="text-sm font-mono text-indigo-300">
              INSERT INTO public.users (name)
              <br />
              VALUES ('Raul'), ('Miguel Angel');
            </code>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Una vez ejecutado, recarga esta página.
          </p>
        </div>
      </div>
    );
  }

  // Resolve current user
  const currentUser = users.find(u => u.id === params.user) ?? users[0];
  if (!params.user) {
    redirect(`/?user=${currentUser.id}`);
  }

  const cookieStore = await cookies();
  const authUserId = cookieStore.get('auth_user')?.value;

  if (authUserId !== currentUser.id) {
    return <LoginForm users={users} />;
  }

  const tasks = await getTasks(currentUser.id);
  const tab = params.tab ?? 'gantt';

  return (
    <div className="min-h-screen flex flex-col">
      <Header users={users} currentUserId={currentUser.id} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Vista de {currentUser.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {tasks.length} tareas · {courses.length} asignaturas
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
          {[
            { key: 'gantt', label: '📊 Gantt' },
            { key: 'dashboard', label: '📈 Progreso' },
            { key: 'lista', label: '📋 Lista' },
          ].map(({ key, label }) => (
            <a
              key={key}
              href={`?user=${currentUser.id}&tab=${key}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Tab content */}
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400">Cargando…</div>}>
          {tab === 'gantt' && (
            <GanttChart tasks={tasks} courses={courses} />
          )}
          {tab === 'dashboard' && (
            <Dashboard tasks={tasks} courses={courses} />
          )}
          {tab === 'lista' && (
            <TaskList tasks={tasks} courses={courses} />
          )}
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-700 py-4">
        <p className="text-center text-xs text-slate-400">
          UOC Planner · Raul & Miguel Angel · Desplegado en Vercel · Powered by Supabase
        </p>
      </footer>
    </div>
  );
}
