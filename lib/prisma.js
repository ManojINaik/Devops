import { PrismaClient } from '@prisma/client';

function getDbUrl() {
  // Try all possible environment variables
  const dbUrl = 
    process.env.POSTGRES_PRISMA_URL || 
    process.env.POSTGRES_URL_NON_POOLING || 
    process.env.DATABASE_URL || 
    process.env.NEXT_PUBLIC_DRIZZLE_URL;
  
  if (!dbUrl) {
    console.error('Prisma environment variables check:', {
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
      POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXT_PUBLIC_DRIZZLE_URL: !!process.env.NEXT_PUBLIC_DRIZZLE_URL,
      NODE_ENV: process.env.NODE_ENV
    });
    throw new Error('No database URL found for Prisma client');
  }

  const maskedUrl = dbUrl.replace(/\/\/[^@]+@/, '//****:****@');
  console.log('Prisma connecting with URL:', maskedUrl);
  return dbUrl;
}

// Initialize Prisma Client with explicit configuration
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasourceUrl: getDbUrl(),
    log: ['query', 'error', 'warn'],
  });
};

// Use global object for caching in development
const globalThis = global;
const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
