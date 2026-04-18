import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, users, streaks } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function isYesterday(date: Date, today: Date): boolean {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(date, yesterday);
}

export const POST: RequestHandler = async ({ request, cookies }) => {
    const sessionId = cookies.get('session');
    if (!sessionId) {
        throw error(401, 'No autorizado');
    }
    
    const { sessions: sessionsTable } = await import('$lib/server/schema');
    const session = await db.select().from(sessionsTable).where(eq(sessionsTable.id, sessionId)).get();
    
    if (!session) {
        throw error(401, 'Sesión inválida');
    }
    
    let body: any;
    try {
        body = await request.json();
    } catch {
        throw error(400, 'JSON inválido');
    }
    
    const { taskId, completed } = body;
    
    if (taskId === undefined) {
        throw error(400, ' taskId es requerido');
    }
    
    const { tasks } = await import('$lib/server/schema');
    
    if (completed) {
        await db.update(tasks)
            .set({ completed: true, completedAt: new Date() })
            .where(eq(tasks.id, taskId));
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streakRecord = await db.select()
            .from(streaks)
            .where(eq(streaks.userId, session.userId))
            .get();
        
        if (!streakRecord) {
            streakRecord = await db.insert(streaks).values({
                userId: session.userId,
                currentStreak: 1,
                longestStreak: 1,
                lastCompletedDate: today
            }).returning();
        } else {
            const lastDate = streakRecord.lastCompletedDate ? new Date(streakRecord.lastCompletedDate) : null;
            lastDate?.setHours(0, 0, 0, 0);
            
            let newStreak = streakRecord.currentStreak;
            
            if (lastDate && isSameDay(lastDate, today)) {
                // Ya completó hoy, no increase
            } else if (lastDate && isYesterday(lastDate, today)) {
                newStreak = streakRecord.currentStreak + 1;
            } else {
                newStreak = 1;
            }
            
            const newLongest = Math.max(newStreak, streakRecord.longestStreak);
            
            await db.update(streaks)
                .set({
                    currentStreak: newStreak,
                    longestStreak: newLongest,
                    lastCompletedDate: today
                })
                .where(eq(streaks.id, streakRecord.id));
            
            streakRecord = { ...streakRecord, currentStreak: newStreak, longestStreak: newLongest };
        }
        
        return json({ 
            success: true, 
            streak: streakRecord.currentStreak,
            longestStreak: streakRecord.longestStreak
        });
    } else {
        await db.update(tasks)
            .set({ completed: false, completedAt: null })
            .where(eq(tasks.id, taskId));
        
        return json({ success: true });
    }
};