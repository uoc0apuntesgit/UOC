'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { createUser } from '@/app/actions/tasks';

export function NewUserForm() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const newUser = await createUser(name.trim());
            router.push(`/?user=${newUser.id}`);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <GraduationCap className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Bienvenido a UOC Planner</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    Crea tu perfil de estudiante para subir tu calendario en formato ICS y empezar a organizarte.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tu nombre o apodo"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                            autoFocus
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all"
                    >
                        {loading ? 'Creando perfil...' : 'Empezar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
