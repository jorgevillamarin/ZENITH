import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ request, cookies }) => {
    const sessionId = cookies.get('session');
    
    if (!sessionId) {
        throw error(401, 'No autorizado');
    }
    
    const { sessions } = await import('$lib/server/schema');
    const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
    
    if (!session) {
        throw error(401, 'Sesión inválida');
    }
    
    let body: any;
    try {
        body = await request.json();
    } catch {
        throw error(400, 'El cuerpo debe ser JSON válido');
    }
    
    const { name, profileImage } = body;
    
    const updateData: any = {};
    
    if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) {
            throw error(400, 'El nombre es obligatorio');
        }
        updateData.name = name.trim();
    }
    
    if (profileImage !== undefined) {
        updateData.profileImage = profileImage;
    }
    
    if (Object.keys(updateData).length === 0) {
        throw error(400, 'No hay datos para actualizar');
    }
    
    const [updatedUser] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, session.userId))
        .returning();

    return json({ 
        success: true, 
        user: { 
            id: updatedUser.id, 
            email: updatedUser.email, 
            name: updatedUser.name,
            profileImage: updatedUser.profileImage
        }
    });
};