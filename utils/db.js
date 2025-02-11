import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DRIZZLE_URL;

// Debug log (without exposing sensitive information)
if (!connectionString) {
  console.error('No database connection string found');
} else {
  const maskedString = connectionString.replace(/\/\/[^@]+@/, '//****:****@');
  console.log('Database connection string format:', maskedString);
}

if (!connectionString) {
  throw new Error(
    'Database connection string not found. Please set either DATABASE_URL or NEXT_PUBLIC_DRIZZLE_URL environment variable.'
  );
}

let db;
try {
  const sql = neon(connectionString);
  db = drizzle(sql, { schema });
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  throw error;
}

export { db };