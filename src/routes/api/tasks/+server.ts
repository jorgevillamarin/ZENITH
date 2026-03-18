import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tasks, type NewTask } from '$lib/server/schema';
import type { RequestHandler } from './$types';

// Obtener todas las tareas (GET /api/tasks)
export const GET: RequestHandler = async () => {
    const allTasks = await db.select().from(tasks).all();
    return json(allTasks);
};

export const POST: RequestHandler = async ({ request }) => {
    // Añadimos priority a los datos que extraemos
    const { title, description, priority } = await request.json();
    
    const [newTask] = await db.insert(tasks).values({
        title,
        description,
        priority: priority || 'media', 
        completed: false
    }).returning();

    return json(newTask, { status: 201 });
};