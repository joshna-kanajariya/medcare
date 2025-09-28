import "server-only";

import { prisma } from "./prisma";
import { logError } from "./logger";

export { prisma };

export const testDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logError("Database connection failed", error instanceof Error ? error : { error });
    return false;
  }
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};