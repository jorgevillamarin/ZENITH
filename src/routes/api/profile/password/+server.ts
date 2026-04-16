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
    
    const { currentPassword, newPassword } = body;
    
    const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
    
    if (!user || user.password !== currentPassword) {
        throw error(400, 'La contraseña actual es incorrecta');
    }
    
    await db.update(users)
        .set({ password: newPassword })
        .where(eq(users.id, session.userId))
        .run();

    return json({ success: true, message: 'Contraseña actualizada' });
};