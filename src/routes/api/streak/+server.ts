import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, users, streaks, userStats, badges, userBadges, dailyChallenges, activityLog } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
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
    
    const taskToCheck = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
    if (!taskToCheck || taskToCheck.userId !== session.userId) {
        throw error(404, 'Tarea no encontrada');
    }
    
    if (completed) {
        await db.update(tasks)
            .set({ completed: true, completedAt: new Date() })
            .where(eq(tasks.id, taskId));
        
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streakRecord = await db.select()
            .from(streaks)
            .where(eq(streaks.userId, session.userId))
            .get();
        
        let justIncreased = false;
        
        if (!streakRecord) {
            streakRecord = await db.insert(streaks).values({
                userId: session.userId,
                currentStreak: 1,
                longestStreak: 1,
                lastCompletedDate: today
            }).returning();
            justIncreased = true;
        } else {
            const lastDate = streakRecord.lastCompletedDate ? new Date(streakRecord.lastCompletedDate) : null;
            lastDate?.setHours(0, 0, 0, 0);
            
            let newStreak = streakRecord.currentStreak;
            
            if (lastDate && isSameDay(lastDate, today)) {
                // Ya completó hoy, no increase
            } else if (lastDate && isYesterday(lastDate, today)) {
                newStreak = streakRecord.currentStreak + 1;
                justIncreased = true;
            } else {
                newStreak = 1;
                justIncreased = true;
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
        
        let xpEarned = 10;
        let levelUp = false;
        let currentLevel = 1;
        
        try {
            let stats = await db.select().from(userStats).where(eq(userStats.userId, session.userId)).get();
            if (!stats) {
                await db.insert(userStats).values({ userId: session.userId });
                stats = await db.select().from(userStats).where(eq(userStats.userId, session.userId)).get();
            }
            
            const lastCompleted = stats?.lastTaskCompletedAt ? new Date(stats.lastTaskCompletedAt) : null;
            let newCombo = 1;
            if (lastCompleted) {
                const diffMinutes = (now.getTime() - lastCompleted.getTime()) / (1000 * 60);
                if (diffMinutes <= 30) {
                    newCombo = (stats?.currentCombo || 0) + 1;
                }
            }
            
            const comboBonus = Math.min((newCombo - 1), 5) * 5;
            xpEarned = 10 + comboBonus;
            
            const newXP = (stats?.xp || 0) + xpEarned;
            
            const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000, 25000, 35000, 50000];
            currentLevel = stats?.level || 1;
            for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
                if (newXP >= LEVEL_THRESHOLDS[i]) {
                    currentLevel = i + 1;
                    break;
                }
            }
            levelUp = currentLevel > (stats?.level || 1);
            
            const updates: any = {
                xp: newXP,
                level: currentLevel,
                totalTasksCompleted: (stats?.totalTasksCompleted || 0) + 1,
                currentCombo: newCombo,
                longestCombo: Math.max(stats?.longestCombo || 0, newCombo),
                lastTaskCompletedAt: now,
                dailyTasksToday: (stats?.dailyTasksToday || 0) + 1,
                weeklyTasksThisWeek: (stats?.weeklyTasksThisWeek || 0) + 1,
                lastDailyReset: today,
                lastWeeklyReset: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
            };
            
            await db.update(userStats).set(updates).where(eq(userStats.id, stats.id));
            
            const challenge = await db.select()
                .from(dailyChallenges)
                .where(and(
                    eq(dailyChallenges.userId, session.userId),
                    eq(dailyChallenges.date, today)
                )).get();
            
            if (challenge) {
                const newCompleted = challenge.completedTasks + 1;
                const challengeCompleted = newCompleted >= challenge.targetTasks;
                await db.update(dailyChallenges).set({
                    completedTasks: newCompleted,
                    completed: challengeCompleted
                }).where(eq(dailyChallenges.id, challenge.id));
                
                if (challengeCompleted && !challenge.completed) {
                    await db.update(userStats).set({ xp: newXP + challenge.xpReward }).where(eq(userStats.id, stats.id));
                    xpEarned += challenge.xpReward;
                }
            } else {
                const targetTasks = 3 + Math.floor(Math.random() * 5);
                const xpReward = targetTasks * 10;
                await db.insert(dailyChallenges).values({
                    userId: session.userId,
                    date: today,
                    targetTasks,
                    xpReward,
                    completedTasks: 1,
                    completed: targetTasks <= 1
                });
            }
            
            const taskCount = stats?.totalTasksCompleted || 0;
            const allBadges = await db.select().from(badges).all();
            const earned = await db.select().from(userBadges).where(eq(userBadges.userId, session.userId)).all();
            const earnedIds = earned.map(b => b.badgeId);
            
            for (const badge of allBadges) {
                if (earnedIds.includes(badge.id)) continue;
                
                let earnedNow = false;
                if (badge.requirement === 'total_tasks') {
                    earnedNow = taskCount >= badge.requirementValue;
                } else if (badge.requirement === 'combo') {
                    earnedNow = newCombo >= badge.requirementValue;
                } else if (badge.requirement === 'streak') {
                    earnedNow = streakRecord.currentStreak >= badge.requirementValue;
                }
                
                if (earnedNow) {
                    await db.insert(userBadges).values({ userId: session.userId, badgeId: badge.id });
                }
            }
        } catch (e) {
            console.error('Gamification error:', e);
        }
        
        return json({ 
            success: true, 
            streak: streakRecord?.currentStreak || 1,
            longestStreak: streakRecord?.longestStreak || 1,
            justIncreased,
            xpEarned,
            newCombo: 1,
            level: currentLevel,
            levelUp,
            comboBonus: 0
        });
    } else {
        await db.update(tasks)
            .set({ completed: false, completedAt: null })
            .where(eq(tasks.id, taskId));
        
        return json({ success: true });
    }
};