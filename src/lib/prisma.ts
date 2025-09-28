import "server-only";

import { PrismaClient } from "@prisma/client";

import { env, isDev } from "./env";
import { logger } from "./logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDev ? ["query", "error", "warn"] : ["error"],
  });

if (!globalForPrisma.prisma) {
  logger.info({ provider: "mysql" }, "Initialized Prisma client");
}

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
