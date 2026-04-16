import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function check() {
  const result = await client.execute({ sql: "PRAGMA table_info(tasks)" });
  console.log('Tasks columns:', result.rows.map((r: any) => r.name));
  
  const streakResult = await client.execute({ sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='streaks'" });
  console.log('Streaks table exists:', streakResult.rows.length > 0);
  
  process.exit(0);
}

check();