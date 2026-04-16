import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function migrate() {
  console.log('Running streaks migration...');
  
  try {
    await client.execute({
      sql: 'ALTER TABLE tasks ADD COLUMN completed_at INTEGER'
    });
    console.log('Added completed_at column');
  } catch (e: any) {
    if (e.message?.includes('duplicate column name')) {
      console.log('Column already exists');
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
  
  console.log('Migration complete');
  process.exit(0);
}

migrate();