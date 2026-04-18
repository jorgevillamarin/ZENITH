import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params }) => {
    const categoryId = Number(params.id);
    
    if (isNaN(categoryId) || categoryId <= 0) {
        throw error(400, 'El ID proporcionado no es válido');
    }
    
    const existing = await db.select().from(categories).where(eq(categories.id, categoryId)).get();
    if (!existing) {
        throw error(404, 'La categoría no existe');
    }
    
    await db.delete(categories).where(eq(categories.id, categoryId));
    
    return json({ success: true, message: 'Categoría eliminada correctamente' });
};