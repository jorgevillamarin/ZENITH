import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, tasks } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
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
    
    if (data.description && typeof data.description !== 'string') {
        errors.push('La descripción debe ser una cadena de texto');
    } else if (data.description && data.description.length > MAX_DESCRIPTION_LENGTH) {
        errors.push(`La descripción no puede exceder ${MAX_DESCRIPTION_LENGTH} caracteres`);
    }
    
    if (data.priority && !['baja', 'media', 'alta'].includes(data.priority)) {
        errors.push('La prioridad debe ser: baja, media o alta');
    }
    
    if (data.categoryId !== undefined && data.categoryId !== null) {
        if (typeof data.categoryId !== 'number') {
            errors.push('La categoría debe ser un número válido');
        }
    }
    
    if (data.dueDate !== undefined && data.dueDate !== null) {
        const date = new Date(data.dueDate);
        if (isNaN(date.getTime())) {
            errors.push('La fecha de vencimiento debe ser una fecha válida');
        }
    }
    
    return { valid: errors.length === 0, errors };
}

function getUserIdFromSession(cookies: any): number | null {
    const sessionId = cookies.get('session');
    if (!sessionId) return null;
    return null;
}

export const GET: RequestHandler = async ({ url, cookies }) => {
    try {
        const sessionId = cookies.get('session');
        if (!sessionId) {
            return json({ error: 'No autorizado' }, { status: 401 });
        }
        
        const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
        if (!session) {
            return json({ error: 'Sesión inválida' }, { status: 401 });
        }
        
        const categoryId = url.searchParams.get('category');
        
        let allTasks;
        if (categoryId) {
            const catId = Number(categoryId);
            if (!isNaN(catId)) {
                allTasks = db.select()
                    .from(tasks)
                    .where(and(eq(tasks.userId, session.userId), eq(tasks.categoryId, catId)))
                    .orderBy(tasks.createdAt)
                    .all();
            } else {
                allTasks = db.select().from(tasks).where(eq(tasks.userId, session.userId)).orderBy(tasks.createdAt).all();
            }
        } else {
            allTasks = db.select().from(tasks).where(eq(tasks.userId, session.userId)).orderBy(tasks.createdAt).all();
        }
        
        return json(allTasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        return json({ error: String(err) }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request, cookies }) => {
    const sessionId = cookies.get('session');
    if (!sessionId) {
        throw error(401, 'No autorizado');
    }
    
    const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
    if (!session) {
        throw error(401, 'Sesión inválida');
    }
    
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
    
    const { title, description, priority, categoryId, dueDate } = body;
    
    let dueDateValue = null;
    if (dueDate) {
        dueDateValue = new Date(dueDate);
    }
    
    const [newTask] = await db.insert(tasks).values({
        userId: session.userId,
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'media',
        categoryId: categoryId || null,
        completed: false,
        dueDate: dueDateValue
    }).returning();

    return json(newTask, { status: 201 });
};