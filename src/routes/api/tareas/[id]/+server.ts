import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Actualizar una tarea específica
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    try {
        const body = await request.json();
        const { id } = params;

        const { data, error } = await locals.supabase
            .from('tareas')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return json({ success: true, data });
    } catch (err: any) {
        return json({ success: false, error: err.message }, { status: 500 });
    }
};

// Eliminar una tarea específica
export const DELETE: RequestHandler = async ({ params, locals }) => {
    try {
        const { id } = params;

        const { error } = await locals.supabase
            .from('tareas')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return json({ success: true, message: 'Tarea eliminada' });
    } catch (err: any) {
        return json({ success: false, error: err.message }, { status: 500 });
    }
};