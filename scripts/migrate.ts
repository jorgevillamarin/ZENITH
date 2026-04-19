import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function migrate() {
  console.log('Running XP and gamification migration...');
  
  try {
    await client.execute({
      sql: 'ALTER TABLE tasks ADD COLUMN completed_at INTEGER'
    });
    console.log('Added completed_at column');
  } catch (e: any) {
    if (e.message?.includes('duplicate column name')) {
      console.log('completed_at column already exists');
    } else {
      console.log('Error (may already exist):', e.message.slice(0, 100));
    }
  }
  
  try {
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS streaks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_completed_date INTEGER,
        created_at INTEGER
      )`
    });
    console.log('Created streaks table');
  } catch (e: any) {
    console.log('Table error:', e.message.slice(0, 100));
  }

  try {
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        total_tasks_completed INTEGER DEFAULT 0,
        current_combo INTEGER DEFAULT 0,
        longest_combo INTEGER DEFAULT 0,
        last_task_completed_at INTEGER,
        daily_tasks_today INTEGER DEFAULT 0,
        weekly_tasks_this_week INTEGER DEFAULT 0,
        last_daily_reset INTEGER,
        last_weekly_reset INTEGER,
        created_at INTEGER
      )`
    });
    console.log('Created user_stats table');
  } catch (e: any) {
    console.log('Table error:', e.message.slice(0, 100));
  }

  try {
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        requirement TEXT NOT NULL,
        requirement_value INTEGER NOT NULL
      )`
    });
    console.log('Created badges table');
  } catch (e: any) {
    console.log('Table error:', e.message.slice(0, 100));
  }

  try {
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS user_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        badge_id INTEGER NOT NULL REFERENCES badges(id),
        earned_at INTEGER
      )`
    });
    console.log('Created user_badges table');
  } catch (e: any) {
    console.log('Table error:', e.message.slice(0, 100));
  }

  try {
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS daily_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        date INTEGER NOT NULL,
        target_tasks INTEGER NOT NULL,
        completed_tasks INTEGER DEFAULT 0,
        xp_reward INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at INTEGER
      )`
    });
    console.log('Created daily_challenges table');
  } catch (e: any) {
    console.log('Table error:', e.message.slice(0, 100));
  }

  try {
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        date INTEGER NOT NULL,
        tasks_completed INTEGER DEFAULT 0,
        xp_earned INTEGER DEFAULT 0
      )`
    });
    console.log('Created activity_log table');
  } catch (e: any) {
    console.log('Table error:', e.message.slice(0, 100));
  }

  console.log('Migration complete');
  process.exit(0);
}

migrate();