import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, tasks } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
    const sessionId = cookies.get('session');
    if (!sessionId) {
        return json({ notifications: [] }, { status: 401 });
    }
    
    const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
    if (!session) {
        return json({ notifications: [] }, { status: 401 });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const allTasks = await db.select().from(tasks).where(eq(tasks.userId, session.userId)).all();
    
    const overdueTasks = allTasks.filter((t: any) => {
        if (t.completed || !t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    });
    
    const dueTodayTasks = allTasks.filter((t: any) => {
        if (t.completed || !t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
    });
    
    const upcomingTasks = allTasks.filter((t: any) => {
        if (t.completed || !t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate > today && dueDate <= tomorrow;
    }).slice(0, 3);
    
    return json({
        notifications: {
            overdue: overdueTasks.length,
            dueToday: dueTodayTasks.length,
            overdueTasks: overdueTasks.slice(0, 5).map((t: any) => ({ id: t.id, title: t.title })),
            dueTodayTasks: dueTodayTasks.slice(0, 5).map((t: any) => ({ id: t.id, title: t.title })),
            upcomingTasks: upcomingTasks.map((t: any) => ({ id: t.id, title: t.title }))
        }
    });
};