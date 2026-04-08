import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tasks, type NewTask } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

function validateUpdateData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validPriorities = ['baja', 'media', 'alta'];
    
    if (data.title !== undefined) {
        if (typeof data.title !== 'string') {
            errors.push('El título debe ser una cadena de texto');
        } else if (!data.title.trim()) {
            errors.push('El título no puede estar vacío');
        } else if (data.title.length > MAX_TITLE_LENGTH) {
            errors.push(`El título no puede exceder ${MAX_TITLE_LENGTH} caracteres`);
        }
    }
    
    if (data.description !== undefined) {
        if (data.description !== null && typeof data.description !== 'string') {
            errors.push('La descripción debe ser una cadena de texto o null');
        } else if (data.description && data.description.length > MAX_DESCRIPTION_LENGTH) {
            errors.push(`La descripción no puede exceder ${MAX_DESCRIPTION_LENGTH} caracteres`);
        }
    }
    
    if (data.priority !== undefined) {
        if (typeof data.priority !== 'string') {
            errors.push('La prioridad debe ser una cadena de texto');
        } else if (!validPriorities.includes(data.priority)) {
            errors.push('La prioridad debe ser: baja, media o alta');
        }
    }
    
    if (data.completed !== undefined) {
        if (typeof data.completed !== 'boolean') {
            errors.push('El estado de completado debe ser un valor booleano');
        }
    }
    
    return { valid: errors.length === 0, errors };
}

export const PATCH: RequestHandler = async ({ params, request }) => {
    const taskId = Number(params.id);
    
    if (isNaN(taskId) || taskId <= 0) {
        throw error(400, 'El ID proporcionado no es válido');
    }
    
    let body: any;
    try {
        body = await request.json();
    } catch {
        throw error(400, 'El cuerpo de la solicitud debe ser JSON válido');
    }
    
    const validation = validateUpdateData(body);
    if (!validation.valid) {
        throw error(400, validation.errors.join(', '));
    }
    
    const updateData: Partial<NewTask> = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.completed !== undefined) updateData.completed = body.completed;

    const [updatedTask] = await db.update(tasks)
        .set(updateData) 
        .where(eq(tasks.id, taskId))
        .returning();

    if (!updatedTask) throw error(404, 'No se pudo actualizar la tarea');
    return json(updatedTask);
};

export const DELETE: RequestHandler = async ({ params }) => {
    const taskId = Number(params.id);
    
    if (isNaN(taskId) || taskId <= 0) {
        throw error(400, 'El ID proporcionado no es un número válido');
    }

    try {
        const existing = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
        if (!existing) {
            throw error(404, 'La tarea no existe');
        }
        
        await db.delete(tasks).where(eq(tasks.id, taskId));
        return json({ success: true, message: `Tarea ${taskId} eliminada correctamente` });
    } catch (err) {
        if ((err as any).status === 404) throw err;
        console.error("Error al borrar:", err);
        throw error(500, 'Hubo un error al intentar eliminar la tarea en la base de datos');
    }
};