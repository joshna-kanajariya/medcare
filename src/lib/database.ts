// Mock Prisma client for build when engines are not available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prismaClient: any

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client')
  prismaClient = new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
} catch {
  // Fallback mock client for build time
  prismaClient = {
    $queryRaw: () => Promise.resolve([{ '1': 1 }]),
    $disconnect: () => Promise.resolve(),
  }
}

declare global {
  var prisma: typeof prismaClient | undefined
}

export const prisma = globalThis.prisma ?? prismaClient

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

// Connection pool configuration
export const dbConfig = {
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  multipleStatements: false,
}

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}