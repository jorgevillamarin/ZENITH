import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN
});

async function seedCategories() {
  console.log('Creating default categories...');
  
  const defaultCategories = [
    { name: 'Trabajo', color: '#ef4444' },
    { name: 'Personal', color: '#3b82f6' },
    { name: 'Estudio', color: '#8b5cf6' },
    { name: 'Hogar', color: '#10b981' },
    { name: 'Salud', color: '#f59e0b' }
  ];
  
  for (const cat of defaultCategories) {
    try {
      await client.execute(
        'INSERT INTO categories (name, color) VALUES (?, ?)',
        [cat.name, cat.color]
      );
      console.log(`Created category: ${cat.name}`);
    } catch (e: any) {
      if (e.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log(`Error creating ${cat.name}:`, e.message);
      } else {
        console.log(`Category ${cat.name} already exists`);
      }
    }
  }
  
  console.log('Default categories created');
  client.close();
}

seedCategories().catch(console.error);