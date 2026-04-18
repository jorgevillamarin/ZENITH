import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function migrate() {
  console.log('Adding user_id to tasks...');
  
  try {
    await client.execute({
      sql: 'ALTER TABLE tasks ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1'
    });
    console.log('Added user_id column');
  } catch (e: any) {
    console.log('Error:', e.message.slice(0, 150));
  }
  
  process.exit(0);
}

migrate();