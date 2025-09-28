import "server-only";

import { performance } from "perf_hooks";
import {
  createPool as createMysqlPool,
  type Pool,
  type PoolOptions,
} from "mysql2/promise";

import { env } from "./env";
import { logger } from "./logger";

let pool: Pool | undefined;

const buildPool = () => {
  const url = new URL(env.DATABASE_URL);

  const connectionLimit = env.DB_POOL_MAX;
  const minPool = env.DB_POOL_MIN;

  const config: PoolOptions = {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username || ""),
    password: decodeURIComponent(url.password || ""),
    database: url.pathname.replace(/^\//, ""),
    waitForConnections: true,
    connectionLimit,
    queueLimit: 0,
  };

  if (url.searchParams.get("sslmode") === "require") {
    Object.assign(config, {
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  logger.info(
    {
      limit: connectionLimit,
      minDesired: minPool,
      host: config.host,
    },
    "Creating MySQL connection pool",
  );

  const newPool = createMysqlPool(config);

  if (minPool > 0) {
    void warmPool(newPool, Math.min(minPool, connectionLimit));
  }

  return newPool;
};

export const getPool = () => {
  if (!pool) {
    pool = buildPool();
  }

  return pool;
};

export const pingDatabase = async () => {
  const client = getPool();
  const started = performance.now();

  const connection = await client.getConnection();

  try {
    await connection.ping();
  } finally {
    connection.release();
  }

  const latency = performance.now() - started;

  return {
    latencyMs: Math.round(latency),
  };
};

export const closePool = async () => {
  if (!pool) return;
  await pool.end();
  pool = undefined;
  logger.info("MySQL connection pool closed");
};

const warmPool = async (newPool: Pool, size: number) => {
  try {
    const connections = await Promise.all(
      Array.from({ length: size }, () => newPool.getConnection()),
    );

    for (const connection of connections) {
      connection.release();
    }

    logger.debug({ size }, "Pre-warmed MySQL connections");
  } catch (error) {
    logger.warn({ error }, "Failed to pre-warm MySQL pool");
  }
};
