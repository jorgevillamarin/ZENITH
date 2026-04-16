import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tasks, categories, type NewTask } from '$lib/server/schema';
import type { RequestHandler } from './$types';

const MIN_TITLE_LENGTH = 5;
const MIN_DESCRIPTION_LENGTH = 5;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

function hasOnlySpecialChars(str: string): boolean {
    const cleanStr = str.replace(/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
    return cleanStr.length === str.length;
}

function validateTaskData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (typeof data.title !== 'string') {
        errors.push('El título debe ser una cadena de texto');
    } else if (!data.title.trim()) {
        errors.push('El título es obligatorio');
    } else if (data.title.length < MIN_TITLE_LENGTH) {
        errors.push(`El título debe tener al menos ${MIN_TITLE_LENGTH} caracteres`);
    } else if (data.title.length > MAX_TITLE_LENGTH) {
        errors.push(`El título no puede exceder ${MAX_TITLE_LENGTH} caracteres`);
    } else if (hasOnlySpecialChars(data.title)) {
        errors.push('El título no puede contener solo caracteres especiales');
    }
    
    if (data.description !== undefined && data.description !== null && data.description.trim()) {
        if (typeof data.description !== 'string') {
            errors.push('La descripción debe ser una cadena de texto');
        } else if (data.description.length < MIN_DESCRIPTION_LENGTH) {
            errors.push(`La descripción debe tener al menos ${MIN_DESCRIPTION_LENGTH} caracteres`);
        } else if (data.description.length > MAX_DESCRIPTION_LENGTH) {
            errors.push(`La descripción no puede exceder ${MAX_DESCRIPTION_LENGTH} caracteres`);
        } else if (hasOnlySpecialChars(data.description)) {
            errors.push('La descripción no puede contener solo caracteres especiales');
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
    
    if (data.categoryId !== undefined && data.categoryId !== null) {
        if (typeof data.categoryId !== 'number') {
            errors.push('La categoría debe ser un número válido');
        }
    }
    
    return { valid: errors.length === 0, errors };
}

export const GET: RequestHandler = async ({ url }) => {
    try {
        const categoryId = url.searchParams.get('category');
        
        let query = db.select().from(tasks).orderBy(tasks.createdAt);
        
        if (categoryId) {
            const catId = Number(categoryId);
            if (!isNaN(catId)) {
                query = query.where(tasks.categoryId.equals(catId));
            }
        }
        
        const allTasks = query.all();
        console.log('Tasks API response:', allTasks.length, 'tasks');
        return json(allTasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        return json({ error: String(err) }, { status: 500 });
    }
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
    
    const { title, description, priority, categoryId } = body;
    
    const [newTask] = await db.insert(tasks).values({
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'media',
        categoryId: categoryId || null,
        completed: false
    }).returning();

    return json(newTask, { status: 201 });
};