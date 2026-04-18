import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN
});

async function migrate() {
  console.log('=== Migration ===');
  
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    console.log('✓ users table');
  } catch (e) { console.log('users:', e.message?.slice(0,50)); }

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        expires_at INTEGER NOT NULL)
      `);
    console.log('✓ sessions table');
  } catch (e) { console.log('sessions:', e.message?.slice(0,50)); }

  console.log('\n=== Default User ===');
  try {
    await client.execute(
      "INSERT INTO users (email, password, name) VALUES ('admin@zenith.com', 'admin123', 'Admin')"
    );
    console.log('✓ admin@zenith.com / admin123');
  } catch (e) {
    console.log('User already exists');
  }
  
  client.close();
}

migrate().catch(console.error);