import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  profileImage: text('profile_image').$type<string | null>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  color: text('color').default('#4facfe'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  priority: text('priority').default('media'),
  categoryId: integer('category_id').references(() => categories.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const streaks = sqliteTable('streaks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastCompletedDate: integer('last_completed_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const userStats = sqliteTable('user_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id).unique(),
  xp: integer('xp').default(0),
  level: integer('level').default(1),
  totalTasksCompleted: integer('total_tasks_completed').default(0),
  currentCombo: integer('current_combo').default(0),
  longestCombo: integer('longest_combo').default(0),
  lastTaskCompletedAt: integer('last_task_completed_at', { mode: 'timestamp' }),
  dailyTasksToday: integer('daily_tasks_today').default(0),
  weeklyTasksThisWeek: integer('weekly_tasks_this_week').default(0),
  lastDailyReset: integer('last_daily_reset', { mode: 'timestamp' }),
  lastWeeklyReset: integer('last_weekly_reset', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const badges = sqliteTable('badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  requirement: text('requirement').notNull(),
  requirementValue: integer('requirement_value').notNull()
});

export const userBadges = sqliteTable('user_badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  badgeId: integer('badge_id').notNull().references(() => badges.id),
  earnedAt: integer('earned_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const dailyChallenges = sqliteTable('daily_challenges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  targetTasks: integer('target_tasks').notNull(),
  completedTasks: integer('completed_tasks').default(0),
  xpReward: integer('xp_reward').notNull(),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const activityLog = sqliteTable('activity_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  tasksCompleted: integer('tasks_completed').default(0),
  xpEarned: integer('xp_earned').default(0)
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type UserStats = typeof userStats.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type ActivityLog = typeof activityLog.$inferSelect;