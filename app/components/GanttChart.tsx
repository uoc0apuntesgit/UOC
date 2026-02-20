'use client';

import { useState, useTransition } from 'react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import type { Task, Course } from '@/lib/supabase';
import { updateTaskDates, updateTaskProgress } from '@/app/actions/tasks';

interface GanttChartProps {
    tasks: Task[];
    courses: Course[];
}

const VIEW_MODES = [
    { label: 'Día', mode: ViewMode.Day },
    { label: 'Semana', mode: ViewMode.Week },
    { label: 'Mes', mode: ViewMode.Month },
];

export function GanttChart({ tasks, courses }: GanttChartProps) {
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
    const [, startTransition] = useTransition();

    const courseColors = Object.fromEntries(courses.map(c => [c.id, c.color]));

    // Filter tasks that have valid dates and map to gantt format
    const ganttTasks: GanttTask[] = tasks
        .filter(t => t.start_date && t.end_date)
        .map(t => {
            const start = new Date(t.start_date);
            const end = new Date(t.end_date);
            // gantt-task-react requires end > start
            if (end <= start) end.setDate(start.getDate() + 1);
            const color = courseColors[t.course_id] ?? '#6366f1';

            return {
                id: t.id,
                name: t.title,
                start,
                end,
                progress: t.progress,
                type: 'task',
                isDisabled: false,
                styles: {
                    backgroundColor: t.completed ? '#22c55e' : color,
                    backgroundSelectedColor: t.completed ? '#16a34a' : color + 'cc',
                    progressColor: 'rgba(255,255,255,0.4)',
                    progressSelectedColor: 'rgba(255,255,255,0.6)',
                },
            } satisfies GanttTask;
        });

    if (ganttTasks.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400">
                No hay tareas para mostrar en el Gantt
            </div>
        );
    }

    function handleDateChange(task: GanttTask) {
        startTransition(async () => {
            await updateTaskDates(task.id, task.start, task.end);
        });
    }

    function handleProgressChange(task: GanttTask) {
        startTransition(async () => {
            await updateTaskProgress(task.id, Math.round(task.progress));
        });
    }

    return (
        <div className="w-full">
            {/* View mode toggle */}
            <div className="flex gap-1 mb-4">
                {VIEW_MODES.map(({ label, mode }) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === mode
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Gantt */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <Gantt
                    tasks={ganttTasks}
                    viewMode={viewMode}
                    onDateChange={handleDateChange}
                    onProgressChange={handleProgressChange}
                    listCellWidth=""
                    columnWidth={viewMode === ViewMode.Day ? 40 : viewMode === ViewMode.Week ? 150 : 300}
                    rowHeight={40}
                    headerHeight={52}
                    barCornerRadius={6}
                    fontSize="13px"
                />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3">
                {courses.map(course => (
                    <div key={course.id} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: course.color }}
                        />
                        {course.name}
                    </div>
                ))}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <span className="w-3 h-3 rounded-full bg-[#22c55e] flex-shrink-0" />
                    Completado
                </div>
            </div>
        </div>
    );
}
