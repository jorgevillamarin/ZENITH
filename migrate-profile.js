import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN
});

async function migrate() {
  console.log('Adding profile_image column...');
  try {
    await client.execute(`ALTER TABLE users ADD COLUMN profile_image TEXT`);
    console.log('✓ Column added');
  } catch (e) {
    console.log('⚠', e.message?.slice(0,50));
  }
  client.close();
}

migrate().catch(console.error);