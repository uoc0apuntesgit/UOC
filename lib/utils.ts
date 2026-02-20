import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, isPast, isWithinInterval, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TaskType } from './supabase';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const TYPE_LABELS: Record<TaskType, string> = {
    PEC: 'PEC',
    PRA: 'Práctica',
    EX: 'Examen',
    PS: 'Prueba Síntesis',
    LECTURA: 'Lectura',
};

export const TYPE_COLORS: Record<TaskType, string> = {
    PEC: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    PRA: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    EX: 'bg-red-100 text-red-700 border-red-200',
    PS: 'bg-orange-100 text-orange-700 border-orange-200',
    LECTURA: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (isPast(date)) return 'Entregado';
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

export function getUrgencyClass(endDate: string): string {
    const date = new Date(endDate);
    const now = new Date();
    if (isPast(date)) return 'text-slate-400';
    if (isWithinInterval(date, { start: now, end: addDays(now, 3) })) return 'text-red-600 font-semibold';
    if (isWithinInterval(date, { start: now, end: addDays(now, 7) })) return 'text-amber-600';
    return 'text-slate-600';
}

export function detectTaskType(summary: string): TaskType {
    const s = summary.toUpperCase();
    if (s.includes('PEC')) return 'PEC';
    if (s.includes('PRA') || s.includes('PRAC') || s.includes('LAB')) return 'PRA';
    if (s.includes('EX') || s.includes('EXAMEN') || s.includes('SÍNTESIS') || s.includes('SINTESIS')) return 'EX';
    if (s.includes('PS') || s.includes('PRUEBA')) return 'PS';
    return 'LECTURA';
}
