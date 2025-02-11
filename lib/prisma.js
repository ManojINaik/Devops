import { PrismaClient } from '@prisma/client';

// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
const prismaGlobal = global;

const prisma = prismaGlobal.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DRIZZLE_URL
    },
  },
});

if (process.env.NODE_ENV !== 'production') prismaGlobal.prisma = prisma;

export default prisma;
