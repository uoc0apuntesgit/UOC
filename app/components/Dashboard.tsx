'use client';

import type { Task, Course } from '@/lib/supabase';
import { formatRelativeDate, getUrgencyClass, TYPE_COLORS, TYPE_LABELS } from '@/lib/utils';

interface DashboardProps {
    tasks: Task[];
    courses: Course[];
}

function ProgressRing({ value, size = 72 }: { value: number; size?: number }) {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={8} fill="none" />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={value >= 80 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#6366f1'}
                strokeWidth={8}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
        </svg>
    );
}

export function Dashboard({ tasks, courses }: DashboardProps) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Group tasks by course
    const byCourse = courses.map(course => {
        const courseTasks = tasks.filter(t => t.course_id === course.id);
        const done = courseTasks.filter(t => t.completed).length;
        const avgProgress = courseTasks.length > 0
            ? Math.round(courseTasks.reduce((s, t) => s + t.progress, 0) / courseTasks.length)
            : 0;
        const nextTask = courseTasks
            .filter(t => !t.completed)
            .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())[0];

        return { course, courseTasks, done, avgProgress, nextTask };
    }).filter(g => g.courseTasks.length > 0);

    // Next global deadline
    const nextDeadlines = tasks
        .filter(t => !t.completed)
        .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
        .slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Overall stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Global progress ring */}
                <div className="sm:col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex items-center gap-5 shadow-sm">
                    <div className="relative">
                        <ProgressRing value={overallProgress} size={80} />
                        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-800 dark:text-white rotate-90">
                            {overallProgress}%
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Progreso global</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{completedTasks}<span className="text-base font-normal text-slate-400">/{totalTasks}</span></p>
                        <p className="text-xs text-slate-400">tareas completadas</p>
                    </div>
                </div>

                {/* Next 3 deadlines */}
                <div className="sm:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Próximas entregas</h3>
                    {nextDeadlines.length === 0 ? (
                        <p className="text-sm text-slate-400">¡Todo al día! 🎉</p>
                    ) : (
                        <ul className="space-y-2">
                            {nextDeadlines.map(task => (
                                <li key={task.id} className="flex items-center gap-3">
                                    <span
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: task.courses?.color ?? '#6366f1' }}
                                    />
                                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 truncate">{task.title}</span>
                                    <span className={`text-xs flex-shrink-0 ${getUrgencyClass(task.end_date)}`}>
                                        {formatRelativeDate(task.end_date)}
                                    </span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full border ${TYPE_COLORS[task.type]}`}>
                                        {TYPE_LABELS[task.type]}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Per-course cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {byCourse.map(({ course, courseTasks, done, avgProgress, nextTask }) => (
                    <div
                        key={course.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div
                                    className="w-2 h-2 rounded-full mb-2"
                                    style={{ backgroundColor: course.color }}
                                />
                                <h4 className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">{course.name}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">{course.credits} créditos · {course.code}</p>
                            </div>
                            <span className="text-lg font-bold" style={{ color: course.color }}>
                                {avgProgress}%
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${avgProgress}%`, backgroundColor: course.color }}
                            />
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                            <span>{done}/{courseTasks.length} tareas</span>
                            {nextTask && (
                                <span className={getUrgencyClass(nextTask.end_date)}>
                                    {formatRelativeDate(nextTask.end_date)}
                                </span>
                            )}
                        </div>

                        {/* Next task */}
                        {nextTask && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate bg-slate-50 dark:bg-slate-700/50 rounded-lg px-2 py-1">
                                → {nextTask.title}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
