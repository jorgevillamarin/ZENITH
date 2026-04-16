import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
    const sessionId = cookies.get('session');
    
    if (!sessionId) {
        return json({ user: null });
    }
    
    const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
    
    if (!session || session.expiresAt < new Date()) {
        cookies.delete('session', { path: '/' });
        return json({ user: null });
    }
    
    const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
    
    if (!user) {
        cookies.delete('session', { path: '/' });
        return json({ user: null });
    }
    
    return json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    });
};

export const DELETE: RequestHandler = async ({ cookies }) => {
    const sessionId = cookies.get('session');
    
    if (sessionId) {
        await db.delete(sessions).where(eq(sessions.id, sessionId)).run();
    }
    
    cookies.delete('session', { path: '/' });
    
    return json({ success: true });
};