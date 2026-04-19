import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    try {
        const body = await request.json();
        const { id } = params;
        const { prioridad } = body;

        if (prioridad === undefined) {
            return json({ success: false, error: 'Falta el campo prioridad' }, { status: 400 });
        }

        const { data, error } = await locals.supabase
            .from('tareas')
            .update({ prioridad })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return json({ success: true, data });
    } catch (err: any) {
        return json({ success: false, error: err.message }, { status: 500 });
    }
};
