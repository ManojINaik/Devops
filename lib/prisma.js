import { PrismaClient } from '@prisma/client';

// Add debug logging for environment variables
const dbUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DRIZZLE_URL;
if (!dbUrl) {
  console.error('No database URL found in environment variables');
} else {
  const maskedUrl = dbUrl.replace(/\/\/[^@]+@/, '//****:****@');
  console.log('Using database URL:', maskedUrl);
}

// Initialize Prisma Client with explicit configuration
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasourceUrl: dbUrl,
  });
};

// Use global object for caching in development
const globalThis = global;
const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
