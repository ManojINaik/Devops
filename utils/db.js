import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Try both environment variables, with DATABASE_URL taking precedence
const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DRIZZLE_URL);
if (!process.env.DATABASE_URL && !process.env.NEXT_PUBLIC_DRIZZLE_URL) {
  throw new Error('No database connection string provided. Please set either DATABASE_URL or NEXT_PUBLIC_DRIZZLE_URL environment variable.');
}
export const db = drizzle(sql, { schema });