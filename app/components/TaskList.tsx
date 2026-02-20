'use client';

import { useTransition } from 'react';
import type { Task, Course } from '@/lib/supabase';
import { updateTaskStatus } from '@/app/actions/tasks';
import { TYPE_COLORS, TYPE_LABELS, formatRelativeDate, getUrgencyClass } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Circle, Calendar } from 'lucide-react';

interface TaskListProps {
    tasks: Task[];
    courses: Course[];
}

export function TaskList({ tasks, courses }: TaskListProps) {
    const [isPending, startTransition] = useTransition();

    function handleToggle(taskId: string, currentCompleted: boolean) {
        startTransition(async () => {
            await updateTaskStatus(taskId, !currentCompleted);
        });
    }

    // Group by course
    const grouped = courses
        .map(course => ({
            course,
            tasks: tasks
                .filter(t => t.course_id === course.id)
                .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime()),
        }))
        .filter(g => g.tasks.length > 0);

    if (tasks.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500">
                No hay tareas. Importa un archivo ICS o añade tareas manualmente.
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${isPending ? 'opacity-60 pointer-events-none' : ''} transition-opacity`}>
            {grouped.map(({ course, tasks: courseTasks }) => {
                const done = courseTasks.filter(t => t.completed).length;
                return (
                    <div key={course.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        {/* Course header */}
                        <div
                            className="flex items-center justify-between px-5 py-3"
                            style={{ backgroundColor: course.color + '18' }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }} />
                                <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{course.name}</h3>
                                <span className="text-xs text-slate-400 dark:text-slate-500">{course.code}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400">{done}/{courseTasks.length}</span>
                                <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${courseTasks.length > 0 ? (done / courseTasks.length) * 100 : 0}%`, backgroundColor: course.color }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Task rows */}
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                            {courseTasks.map(task => (
                                <li
                                    key={task.id}
                                    className={`flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group ${task.completed ? 'opacity-60' : ''}`}
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => handleToggle(task.id, task.completed)}
                                        className="flex-shrink-0 text-slate-300 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                                        aria-label={task.completed ? 'Marcar incompleta' : 'Marcar completa'}
                                    >
                                        {task.completed
                                            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            : <Circle className="w-5 h-5" />
                                        }
                                    </button>

                                    {/* Title */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                                            {task.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            <span className={`text-xs ${getUrgencyClass(task.end_date)}`}>
                                                {format(new Date(task.end_date), 'd MMM yyyy', { locale: es })}
                                                {' · '}{formatRelativeDate(task.end_date)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Type badge */}
                                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${TYPE_COLORS[task.type]}`}>
                                        {TYPE_LABELS[task.type]}
                                    </span>

                                    {/* Progress pill */}
                                    <div className="flex-shrink-0 flex items-center gap-1.5">
                                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${task.progress}%`,
                                                    backgroundColor: task.completed ? '#22c55e' : (task.courses?.color ?? '#6366f1'),
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-400 w-7 text-right">{task.progress}%</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
}
