import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        const allCategories = await db.select().from(categories).all();
        return json(allCategories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        return json([]);
    }
};

export const POST: RequestHandler = async ({ request }) => {
    let body: any;
    try {
        body = await request.json();
    } catch {
        throw error(400, 'El cuerpo de la solicitud debe ser JSON válido');
    }
    
    const { name, color } = body;
    
    if (!name || typeof name !== 'string' || !name.trim()) {
        throw error(400, 'El nombre de la categoría es obligatorio');
    }
    
    try {
        const existing = await db.select().from(categories).where(eq(categories.name, name.trim())).get();
        if (existing) {
            throw error(400, 'Ya existe una categoría con este nombre');
        }
        
        const [newCategory] = await db.insert(categories).values({
            name: name.trim(),
            color: color || '#4facfe'
        }).returning();

        return json(newCategory, { status: 201 });
    } catch (err: any) {
        if (err.status === 400) throw err;
        console.error('Error creating category:', err);
        throw error(500, 'Error al crear la categoría');
    }
};