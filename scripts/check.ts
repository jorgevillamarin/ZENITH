import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function check() {
  const tasks = await client.execute({ sql: "SELECT * FROM tasks ORDER BY id DESC LIMIT 10" });
  console.log('Latest tasks:', JSON.stringify(tasks.rows, null, 2));
  process.exit(0);
}

check();