import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, users, tasks, categories, streaks, userStats, badges, userBadges, dailyChallenges, activityLog } from '$lib/server/schema';
import { eq, and, gte } from 'drizzle-orm';

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
    
    const allTasks = await db.select().from(tasks).where(eq(tasks.userId, user.id)).all();
    const allCategories = await db.select().from(categories).all();
    const unresolvedTasks = allTasks.filter((t: any) => !t.completed);
    const resolvedTasks = allTasks.filter((t: any) => t.completed);
    
    let streakData = { currentStreak: 0, longestStreak: 0, isActive: false };
    try {
        const streak = await db.select()
            .from(streaks)
            .where(eq(streaks.userId, user.id))
            .get();
        if (streak) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const lastDate = streak.lastCompletedDate ? new Date(streak.lastCompletedDate) : null;
            lastDate?.setHours(0, 0, 0, 0);
            
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            
            let isActive = false;
            let newStreak = streak.currentStreak;
            
            if (lastDate) {
                if (lastDate.getTime() === now.getTime()) {
                    isActive = true;
                } else if (lastDate.getTime() === yesterday.getTime()) {
                    isActive = true;
                } else {
                    newStreak = 0;
                }
            }
            
            if (newStreak !== streak.currentStreak) {
                await db.update(streaks)
                    .set({ currentStreak: 0 })
                    .where(eq(streaks.id, streak.id));
            }
            
            streakData = { 
                currentStreak: newStreak, 
                longestStreak: streak.longestStreak,
                isActive: isActive
            };
        }
    } catch (e) {
        console.error('Streak error:', e);
    }
    
    const catGroups = allCategories.map(cat => ({
        category: cat,
        tasks: unresolvedTasks.filter((t: any) => t.categoryId === cat.id)
    }));
    const sinCat = unresolvedTasks.filter((t: any) => !t.categoryId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const overdueCount = unresolvedTasks.filter((t: any) => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    }).length;
    
    const dueTodayCount = unresolvedTasks.filter((t: any) => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
    }).length;
    
    let userStatsData: any = null;
    let userBadgesData: number[] = [];
    let dailyChallengeData: any = null;
    let allBadgesData: any[] = [];
    
    try {
        userStatsData = await db.select().from(userStats).where(eq(userStats.userId, user.id)).get();
        if (!userStatsData) {
            await db.insert(userStats).values({ userId: user.id });
            userStatsData = await db.select().from(userStats).where(eq(userStats.userId, user.id)).get();
        }
        
        allBadgesData = await db.select().from(badges).all();
        if (allBadgesData.length === 0) {
            const defaultBadges = [
                { name: 'Primera Tarea', description: 'Completa tu primera tarea', icon: '🌟', requirement: 'total_tasks', requirementValue: 1 },
                { name: 'Iniciado', description: 'Completa 10 tareas', icon: '🔥', requirement: 'total_tasks', requirementValue: 10 },
                { name: 'Productor', description: 'Completa 50 tareas', icon: '⚡', requirement: 'total_tasks', requirementValue: 50 },
                { name: 'Experto', description: 'Completa 100 tareas', icon: '🏆', requirement: 'total_tasks', requirementValue: 100 },
                { name: 'Maestro', description: 'Completa 500 tareas', icon: '👑', requirement: 'total_tasks', requirementValue: 500 },
                { name: 'Combo 3', description: 'Completa 3 tareas seguidas', icon: '🔥', requirement: 'combo', requirementValue: 3 },
                { name: 'Combo 5', description: 'Completa 5 tareas seguidas', icon: '💥', requirement: 'combo', requirementValue: 5 },
                { name: 'Combo 10', description: 'Completa 10 tareas seguidas', icon: '🌈', requirement: 'combo', requirementValue: 10 },
                { name: 'Racha 7', description: 'Mantén una racha de 7 días', icon: '📅', requirement: 'streak', requirementValue: 7 },
                { name: 'Racha 30', description: 'Mantén una racha de 30 días', icon: '🗓️', requirement: 'streak', requirementValue: 30 },
            ];
            for (const badge of defaultBadges) {
                await db.insert(badges).values(badge);
            }
            allBadgesData = await db.select().from(badges).all();
        }
        
        const earned = await db.select().from(userBadges).where(eq(userBadges.userId, user.id)).all();
        userBadgesData = earned.map(b => b.badgeId);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dailyChallengeData = await db.select()
            .from(dailyChallenges)
            .where(and(
                eq(dailyChallenges.userId, user.id),
                eq(dailyChallenges.date, today)
            )).get();
        
        if (!dailyChallengeData) {
            const targetTasks = 3 + Math.floor(Math.random() * 5);
            const xpReward = targetTasks * 10;
            await db.insert(dailyChallenges).values({
                userId: user.id,
                date: today,
                targetTasks,
                xpReward
            });
            dailyChallengeData = await db.select()
                .from(dailyChallenges)
                .where(and(
                    eq(dailyChallenges.userId, user.id),
                    eq(dailyChallenges.date, today)
                )).get();
        }
    } catch (e) {
        console.error('Gamification load error:', e);
    }
    
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
        unresolvedCount: unresolvedTasks.length,
        notifications: {
            overdue: overdueCount,
            dueToday: dueTodayCount
        },
        gamification: {
            stats: userStatsData,
            badges: allBadgesData,
            earnedBadges: userBadgesData,
            dailyChallenge: dailyChallengeData
        }
    };
};