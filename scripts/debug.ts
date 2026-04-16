import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function test() {
  try {
    const result = await client.execute({
      sql: "SELECT * FROM tasks WHERE completed = 0 ORDER BY created_at DESC"
    });
    console.log('Incomplete tasks:', result.rows.length);
    console.log('Sample:', result.rows.slice(0, 3));
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

test();