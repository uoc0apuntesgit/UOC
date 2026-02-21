import { createClient } from '@supabase/supabase-js';

// Use placeholder so the build doesn't crash if env vars are missing
// At runtime, real values from .env.local / Vercel env vars are required
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

// Universal client (works in both server and client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions matching the DB schema
export type User = {
  id: string;
  name: string;
  password?: string;
};

export type Course = {
  id: number;
  code: string;
  name: string;
  credits: number;
  color: string;
};

export type TaskType = 'PEC' | 'PRA' | 'EX' | 'PS' | 'LECTURA';

export type Task = {
  id: string;
  course_id: number;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
  progress: number;
  type: TaskType;
  completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  courses?: Course;
};
