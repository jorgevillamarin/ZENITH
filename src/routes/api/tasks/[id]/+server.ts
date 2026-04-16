import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tasks, type NewTask } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

const MIN_TITLE_LENGTH = 5;
const MIN_DESCRIPTION_LENGTH = 5;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

function hasOnlySpecialChars(str: string): boolean {
    const cleanStr = str.replace(/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
    return cleanStr.length === str.length;
}

function validateUpdateData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validPriorities = ['baja', 'media', 'alta'];
    
    if (data.title !== undefined) {
        if (typeof data.title !== 'string') {
            errors.push('El título debe ser una cadena de texto');
        } else if (!data.title.trim()) {
            errors.push('El título no puede estar vacío');
        } else if (data.title.length < MIN_TITLE_LENGTH) {
            errors.push(`El título debe tener al menos ${MIN_TITLE_LENGTH} caracteres`);
        } else if (data.title.length > MAX_TITLE_LENGTH) {
            errors.push(`El título no puede exceder ${MAX_TITLE_LENGTH} caracteres`);
        } else if (hasOnlySpecialChars(data.title)) {
            errors.push('El título no puede contener solo caracteres especiales');
        }
    }
    
    if (data.description !== undefined && data.description !== null && data.description.trim()) {
        if (typeof data.description !== 'string') {
            errors.push('La descripción debe ser una cadena de texto o null');
        } else if (data.description.length < MIN_DESCRIPTION_LENGTH) {
            errors.push(`La descripción debe tener al menos ${MIN_DESCRIPTION_LENGTH} caracteres`);
        } else if (data.description.length > MAX_DESCRIPTION_LENGTH) {
            errors.push(`La descripción no puede exceder ${MAX_DESCRIPTION_LENGTH} caracteres`);
        } else if (hasOnlySpecialChars(data.description)) {
            errors.push('La descripción no puede contener solo caracteres especiales');
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
    
    if (data.categoryId !== undefined) {
        if (data.categoryId !== null && typeof data.categoryId !== 'number') {
            errors.push('La categoría debe ser un número válido o null');
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
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null;

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