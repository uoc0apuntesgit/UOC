'use server';

import { revalidatePath } from 'next/cache';
import { supabase, type Task } from '@/lib/supabase';

/** Fetch all tasks for a user, joined with their course */
export async function getTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
        .from('tasks')
        .select('*, courses(*)')
        .eq('user_id', userId)
        .order('end_date', { ascending: true });

    if (error) {
        console.error('getTasks error:', error);
        return [];
    }
    return data as Task[];
}

/** Fetch all users */
export async function getUsers() {
    const { data } = await supabase.from('users').select('*').order('name');
    return data ?? [];
}

/** Fetch all courses */
export async function getCourses() {
    const { data } = await supabase.from('courses').select('*').order('name');
    return data ?? [];
}

/** Toggle task completion — sets progress to 100 or 0 */
export async function updateTaskStatus(taskId: string, completed: boolean) {
    const { error } = await supabase
        .from('tasks')
        .update({ completed, progress: completed ? 100 : 0 })
        .eq('id', taskId);

    if (error) throw new Error(error.message);
    revalidatePath('/');
}

/** Set an arbitrary progress value (0–100) */
export async function updateTaskProgress(taskId: string, progress: number) {
    const { error } = await supabase
        .from('tasks')
        .update({ progress, completed: progress === 100 })
        .eq('id', taskId);

    if (error) throw new Error(error.message);
    revalidatePath('/');
}

/** Update start/end dates (called after Gantt drag & drop) */
export async function updateTaskDates(
    taskId: string,
    startDate: Date,
    endDate: Date
) {
    const { error } = await supabase
        .from('tasks')
        .update({ start_date: startDate.toISOString(), end_date: endDate.toISOString() })
        .eq('id', taskId);

    if (error) throw new Error(error.message);
    revalidatePath('/');
}

/** Create a new task */
export async function createTask(task: Partial<Task>) {
    const { error } = await supabase.from('tasks').insert([task]);
    if (error) throw new Error(error.message);
    revalidatePath('/');
}

/** Delete a task */
export async function deleteTask(taskId: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw new Error(error.message);
    revalidatePath('/');
}
