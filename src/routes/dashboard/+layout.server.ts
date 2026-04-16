import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, users, tasks, categories, streaks } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async ({ cookies }) => {
    const sessionId = cookies.get('session');
    
    if (!sessionId) {
        throw redirect(302, '/');
    }
    
    let session;
    try {
        session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
    } catch (e) {
        console.error('Session query error:', e);
        cookies.delete('session', { path: '/' });
        throw redirect(302, '/');
    }
    
    if (!session) {
        cookies.delete('session', { path: '/' });
        throw redirect(302, '/');
    }
    
    if (session.expiresAt < new Date()) {
        cookies.delete('session', { path: '/' });
        throw redirect(302, '/');
    }
    
    let user;
    try {
        user = await db.select()
            .from(users)
            .where(eq(users.id, session.userId))
            .get();
    } catch (e) {
        console.error('User query error:', e);
        cookies.delete('session', { path: '/' });
        throw redirect(302, '/');
    }
    
    if (!user) {
        cookies.delete('session', { path: '/' });
        throw redirect(302, '/');
    }
    
    const allTasks = await db.select().from(tasks).all();
    const allCategories = await db.select().from(categories).all();
    const unresolvedTasks = allTasks.filter((t: any) => !t.completed);
    const resolvedTasks = allTasks.filter((t: any) => t.completed);
    
    let streakData = { currentStreak: 0, longestStreak: 0 };
    try {
        const streak = await db.select()
            .from(streaks)
            .where(eq(streaks.userId, user.id))
            .get();
        if (streak) {
            streakData = { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak };
        }
    } catch (e) {
        console.error('Streak error:', e);
    }
    
    const catGroups = allCategories.map(cat => ({
        category: cat,
        tasks: unresolvedTasks.filter((t: any) => t.categoryId === cat.id)
    }));
    const sinCat = unresolvedTasks.filter((t: any) => !t.categoryId);
    
    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            profileImage: user.profileImage || null
        },
        streak: streakData,
        categories: allCategories,
        catGroups: catGroups,
        sinCat: sinCat,
        resolvedTasks: resolvedTasks,
        misTareas: unresolvedTasks,
        misCategorias: allCategories,
        allTasksCount: allTasks.length,
        unresolvedCount: unresolvedTasks.length
    };
};