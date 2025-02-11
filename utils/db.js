import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function getConnectionString() {
  // Try all possible environment variables
  const dbUrl = 
    process.env.POSTGRES_PRISMA_URL || 
    process.env.POSTGRES_URL_NON_POOLING || 
    process.env.DATABASE_URL || 
    process.env.NEXT_PUBLIC_DRIZZLE_URL;
  
  if (!dbUrl) {
    console.error('Environment variables check:', {
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
      POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXT_PUBLIC_DRIZZLE_URL: !!process.env.NEXT_PUBLIC_DRIZZLE_URL,
      NODE_ENV: process.env.NODE_ENV
    });
    throw new Error(
      'Database connection string not found. Please check environment variables.'
    );
  }

  return dbUrl;
}

let db;
try {
  const connectionString = getConnectionString();
  const maskedString = connectionString.replace(/\/\/[^@]+@/, '//****:****@');
  console.log('Attempting database connection with:', maskedString);
  
  const sql = neon(connectionString);
  db = drizzle(sql, { schema });
  console.log('Database connection established successfully');
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  throw error;
}

export { db };