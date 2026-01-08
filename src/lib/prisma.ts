/**
 * Configuration Prisma 6.x pour Next.js
 * ======================================
 * SIMPLE ET STABLE - Prisma 6 fonctionne sans problèmes
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
