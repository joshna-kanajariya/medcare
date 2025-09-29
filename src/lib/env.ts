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
    
    // Authentication
    NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters").default("development-secret-key-change-in-production-min-32-chars"),
    NEXTAUTH_URL: z.string().url().optional(),
    
    // Google OAuth
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    
    // Twilio SMS
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_PHONE_NUMBER: z.string().optional(),
    
    // JWT
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters").default("development-jwt-secret-key-change-in-production-min-32-chars"),
    JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters").default("development-jwt-refresh-secret-key-change-in-production-min-32-chars"),
    
    // Security
    BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
    SESSION_MAX_AGE: z.coerce.number().int().min(300).max(604800).default(86400), // 24 hours
    REFRESH_TOKEN_MAX_AGE: z.coerce.number().int().min(86400).max(2592000).default(604800), // 7 days
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
  
  // Authentication
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  
  // Twilio SMS
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  
  // Security
  BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS,
  SESSION_MAX_AGE: process.env.SESSION_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE: process.env.REFRESH_TOKEN_MAX_AGE,
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
