import { createClient } from '@libsql/client';
import 'dotenv/config';

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN
});

async function migrate() {
  console.log('Creating categories table...');
  
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT DEFAULT '#4facfe',
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    console.log('Categories table created');
  } catch (e: any) {
    console.log('Categories table error:', e.message);
  }

  console.log('Adding category_id column to tasks...');
  
  try {
    await client.execute(`
      ALTER TABLE tasks ADD COLUMN category_id INTEGER REFERENCES categories(id)
    `);
    console.log('Column added successfully');
  } catch (e: any) {
    console.log('Column error:', e.message);
  }

  console.log('Migration completed');
  client.close();
}

migrate().catch(console.error);