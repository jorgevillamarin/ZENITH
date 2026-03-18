import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tasks, type NewTask } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
    const taskId = Number(params.id);
    
    // Partial<NewTask> significa que todos los campos de NewTask son opcionales aquí
    const body = (await request.json()) as Partial<NewTask>;

    const [updatedTask] = await db.update(tasks)
        .set(body) 
        .where(eq(tasks.id, taskId))
        .returning();

    if (!updatedTask) throw error(404, 'No se pudo actualizar la tarea');
    return json(updatedTask);
};

// Exportamos la función con el nombre en mayúsculas DELETE (método HTTP)
export const DELETE: RequestHandler = async ({ params }) => {
    // 1. Extraemos el ID de la URL (ej. de /api/tasks/5, el ID es 5)
    // Lo convertimos a número porque la base de datos lo espera como entero
    const taskId = Number(params.id);
    
    // 2. Validación de seguridad básica
    if (isNaN(taskId)) {
        throw error(400, 'El ID proporcionado no es un número válido');
    }

    try {
        // 3. Ejecutamos el borrado en SQLite usando Drizzle
        await db.delete(tasks).where(eq(tasks.id, taskId));
        
        // 4. Respondemos al frontend que todo salió bien
        return json({ success: true, message: `Tarea ${taskId} eliminada correctamente` });
    } catch (err) {
        console.error("Error al borrar:", err);
        throw error(500, 'Hubo un error al intentar eliminar la tarea en la base de datos');
    }
};