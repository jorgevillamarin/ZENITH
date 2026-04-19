import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users, sessions } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { verifyPassword, generateSecureId } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
    let body: any;
    try {
        body = await request.json();
    } catch {
        throw error(400, 'El cuerpo debe ser JSON válido');
    }
    
    const { email, password } = body;
    
    if (!email || !password) {
        throw error(400, 'Email y contraseña son obligatorios');
    }
    
    const user = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).get();
    
    if (!user || !(await verifyPassword(password, user.password))) {
        throw error(401, 'Credenciales incorrectas');
    }
    
    const sessionId = generateSecureId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await db.insert(sessions).values({
        id: sessionId,
        userId: user.id,
        expiresAt: expiresAt
    });
    
    cookies.set('session', sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        secure: true
    });
    
    return json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    });
};