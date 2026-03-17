import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    const { data, error } = await locals.supabase
        .from('tareas')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return json({ error: error.message }, { status: 400 });
    return json({ success: true, data });
};