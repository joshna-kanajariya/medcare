import "server-only";

import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z
      .string()
      .min(1, "DATABASE_URL is required")
      .refine((value) => value.startsWith("mysql://"), {
        message: "DATABASE_URL must be a MySQL connection string",
      }),
    DB_POOL_MIN: z.coerce.number().int().min(0).max(50).default(1),
    DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    EXTERNAL_SERVICE_BASE_URL: z.string().url().optional(),
  })
  .refine((value) => value.DB_POOL_MIN <= value.DB_POOL_MAX, {
    message: "DB_POOL_MIN must be less than or equal to DB_POOL_MAX",
    path: ["DB_POOL_MIN"],
  });

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  DB_POOL_MIN: process.env.DB_POOL_MIN,
  DB_POOL_MAX: process.env.DB_POOL_MAX,
  LOG_LEVEL: process.env.LOG_LEVEL,
  EXTERNAL_SERVICE_BASE_URL: process.env.EXTERNAL_SERVICE_BASE_URL,
});

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Missing or invalid environment variables. Check your .env file.");
}

export const env = parsed.data;

export const isDev = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
export const isProd = env.NODE_ENV === "production";
