import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tasks, type NewTask } from '$lib/server/schema';
import type { RequestHandler } from './$types';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

function validateTaskData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (typeof data.title !== 'string') {
        errors.push('El título debe ser una cadena de texto');
    } else if (!data.title.trim()) {
        errors.push('El título es obligatorio');
    } else if (data.title.length > MAX_TITLE_LENGTH) {
        errors.push(`El título no puede exceder ${MAX_TITLE_LENGTH} caracteres`);
    }
    
    if (data.description !== undefined && data.description !== null) {
        if (typeof data.description !== 'string') {
            errors.push('La descripción debe ser una cadena de texto');
        } else if (data.description.length > MAX_DESCRIPTION_LENGTH) {
            errors.push(`La descripción no puede exceder ${MAX_DESCRIPTION_LENGTH} caracteres`);
        }
    }
    
    const validPriorities = ['baja', 'media', 'alta'];
    if (data.priority !== undefined && data.priority !== null) {
        if (typeof data.priority !== 'string') {
            errors.push('La prioridad debe ser una cadena de texto');
        } else if (!validPriorities.includes(data.priority)) {
            errors.push('La prioridad debe ser: baja, media o alta');
        }
    }
    
    return { valid: errors.length === 0, errors };
}

export const GET: RequestHandler = async () => {
    const allTasks = await db.select().from(tasks).all();
    return json(allTasks);
};

export const POST: RequestHandler = async ({ request }) => {
    let body: any;
    try {
        body = await request.json();
    } catch {
        throw error(400, 'El cuerpo de la solicitud debe ser JSON válido');
    }
    
    const validation = validateTaskData(body);
    if (!validation.valid) {
        throw error(400, validation.errors.join(', '));
    }
    
    const { title, description, priority } = body;
    
    const [newTask] = await db.insert(tasks).values({
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'media', 
        completed: false
    }).returning();

    return json(newTask, { status: 201 });
};