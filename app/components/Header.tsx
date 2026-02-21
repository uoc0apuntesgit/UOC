'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { User } from '@/lib/supabase';
import { GraduationCap, Upload, LogOut } from 'lucide-react';
import { useState, useRef } from 'react';
import { logoutUser } from '@/app/actions/auth';

interface HeaderProps {
    users: User[];
    currentUserId: string;
}

export function Header({ users, currentUserId }: HeaderProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function buildUrl(userId: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('user', userId);
        return `${pathname}?${params.toString()}`;
    }

    async function handleICSUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadMsg(null);
        try {
            const text = await file.text();
            const res = await fetch('/api/ics-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ icsContent: text, userId: currentUserId }),
            });
            const data = await res.json();
            setUploadMsg(data.success ? `✓ ${data.count} tareas importadas` : `✗ ${data.error}`);
            // Refresh the page to show new tasks
            if (data.success) setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            setUploadMsg(`✗ Error: ${err}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                        <GraduationCap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">UOC</span>
                        <span className="font-light text-slate-500 dark:text-slate-400 text-sm"> Planner</span>
                    </div>
                </div>

                {/* User selector */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    {users.filter(u => u.id === currentUserId).map(user => (
                        <div
                            key={user.id}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        >
                            {user.name}
                        </div>
                    ))}
                </div>

                {/* ICS import */}
                <div className="flex items-center gap-2">
                    {uploadMsg && (
                        <span className={`text-xs px-2 py-1 rounded-lg ${uploadMsg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {uploadMsg}
                        </span>
                    )}
                    <input
                        type="file"
                        accept=".ics"
                        ref={fileInputRef}
                        onChange={handleICSUpload}
                        className="hidden"
                        id="ics-upload"
                    />
                    <label
                        htmlFor="ics-upload"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer border ${uploading
                            ? 'border-slate-200 text-slate-400 cursor-wait'
                            : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                            }`}
                    >
                        <Upload className="w-3.5 h-3.5" />
                        {uploading ? 'Importando…' : 'Importar .ics'}
                    </label>

                    <button
                        onClick={async () => {
                            await logoutUser();
                            window.location.reload();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
