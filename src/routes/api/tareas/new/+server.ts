import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const body = await request.json();
        const { data, error } = await locals.supabase
            .from('tareas')
            .insert([body])
            .select()
            .single();

        if (error) throw error;
        return json({ success: true, data }, { status: 201 });
    } catch (err: any) {
        return json({ success: false, error: err.message }, { status: 500 });
    }
};