import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, users, userStats } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ cookies }) => {
    const sessionId = cookies.get('session');
    if (!sessionId) {
        throw redirect(302, '/');
    }
    
    const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
    if (!session) {
        throw redirect(302, '/');
    }
    
    const allStats = await db.select().from(userStats).all();
    const allUsers = await db.select().from(users).all();
    
    const leaderboard = allStats
        .map(stat => {
            const user = allUsers.find(u => u.id === stat.userId);
            return {
                userId: stat.userId,
                name: user?.name || 'Usuario',
                xp: stat.xp,
                level: stat.level,
                totalTasksCompleted: stat.totalTasksCompleted,
                currentCombo: stat.currentCombo
            };
        })
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10);

    return {
        leaderboard,
        currentUserId: session.userId
    };
};