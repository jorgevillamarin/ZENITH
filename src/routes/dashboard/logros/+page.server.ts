import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, users, badges, userBadges, userStats, streaks } from '$lib/server/schema';
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
    
    const userId = session.userId;
    
    const allBadges = await db.select().from(badges).all();
    const earned = await db.select().from(userBadges).where(eq(userBadges.userId, userId)).all();
    const userStatsData = await db.select().from(userStats).where(eq(userStats.userId, userId)).get();
    const streak = await db.select().from(streaks).where(eq(streaks.userId, userId)).get();
    
    const earnedIds = earned.map(b => b.badgeId);
    const earnedAt = earned.reduce((acc: any, b) => {
        acc[b.badgeId] = b.earnedAt;
        return acc;
    }, {});
    
    const badgesWithStatus = allBadges.map(badge => {
        const isEarned = earnedIds.includes(badge.id);
        let progress = 0;
        let target = badge.requirementValue;
        
        if (badge.requirement === 'total_tasks') {
            progress = userStatsData?.totalTasksCompleted || 0;
        } else if (badge.requirement === 'combo') {
            progress = userStatsData?.currentCombo || 0;
        } else if (badge.requirement === 'streak') {
            progress = streak?.currentStreak || 0;
        }
        
        return {
            ...badge,
            earned: isEarned,
            earnedAt: earnedAt[badge.id] || null,
            progress,
            target,
            percentage: Math.min((progress / target) * 100, 100)
        };
    });
    
    return {
        badges: badgesWithStatus,
        stats: {
            xp: userStatsData?.xp || 0,
            level: userStatsData?.level || 1,
            totalTasks: userStatsData?.totalTasksCompleted || 0,
            currentCombo: userStatsData?.currentCombo || 0,
            longestCombo: userStatsData?.longestCombo || 0,
            currentStreak: streak?.currentStreak || 0,
            longestStreak: streak?.longestStreak || 0
        }
    };
};