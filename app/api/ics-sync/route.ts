import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { detectTaskType } from '@/lib/utils';

// Force dynamic so Turbopack doesn't try to evaluate node-ical at build time
export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
    try {
        const { icsContent, userId } = await req.json();

        if (!icsContent || !userId) {
            return Response.json({ success: false, error: 'Missing icsContent or userId' }, { status: 400 });
        }

        // First check we have a valid userId
        const { data: user } = await supabase
            .from('users')
            .select('id, name')
            .eq('id', userId)
            .single();

        if (!user) {
            return Response.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const events = (await import('node-ical')).parseICS(icsContent);


        // Fetch course catalog to match titles
        const { data: courses } = await supabase.from('courses').select('*');
        const courseMap = new Map((courses ?? []).map((c: { name: string; id: number }) => [c.name.toLowerCase(), c.id]));

        const tasksToInsert = Object.values(events)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((e: any) => e.type === 'VEVENT' && e.summary)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((event: any) => {
                const summary: string = event.summary ?? 'Sin título';
                const type = detectTaskType(summary);

                // Try to match to a known course by looking for course name in the summary
                let courseId: number | null = null;
                for (const [name, id] of courseMap.entries()) {
                    if (summary.toLowerCase().includes(name)) {
                        courseId = id as number;
                        break;
                    }
                }

                const startDate: Date = event.start ?? new Date();
                const endDate: Date = event.end ?? event.start ?? new Date();

                return {
                    user_id: userId,
                    course_id: courseId,
                    title: summary,
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    type,
                    progress: 0,
                    completed: false,
                };
            });

        if (tasksToInsert.length === 0) {
            return Response.json({ success: true, count: 0, message: 'No VEVENT entries found' });
        }

        const { error } = await supabase.from('tasks').insert(tasksToInsert);

        if (error) {
            console.error('ICS sync insert error:', error);
            return Response.json({ success: false, error: error.message }, { status: 500 });
        }

        return Response.json({ success: true, count: tasksToInsert.length });
    } catch (err) {
        console.error('ICS sync error:', err);
        return Response.json({ success: false, error: String(err) }, { status: 500 });
    }
}
