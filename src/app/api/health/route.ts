import { NextResponse } from "next/server";
import { performance } from "perf_hooks";

import { respondWithError } from "@/lib/errors";
import { pingDatabase } from "@/lib/mysql";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { HealthIndicator, HealthResponse, HealthStatus } from "@/types/health";

const DEGRADED_THRESHOLD_MS = 500;

const determineStatus = (latency: number): HealthStatus => {
  if (latency >= DEGRADED_THRESHOLD_MS) return "degraded";
  return "ok";
};

export async function GET() {
  try {
    const checks: HealthIndicator[] = [];

    const mysqlResult = await pingDatabase();
    checks.push({
      component: "mysql",
      status: determineStatus(mysqlResult.latencyMs),
      latencyMs: mysqlResult.latencyMs,
      checkedAt: new Date().toISOString(),
    });

    const prismaStart = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const prismaLatency = Math.round(performance.now() - prismaStart);
    checks.push({
      component: "prisma",
      status: determineStatus(prismaLatency),
      latencyMs: prismaLatency,
      checkedAt: new Date().toISOString(),
    });

    const status: HealthStatus = checks.some((check) => check.status === "degraded")
      ? "degraded"
      : "ok";

    const payload: HealthResponse = {
      status,
      timestamp: new Date().toISOString(),
      uptimeSec: Math.round(process.uptime()),
      version: process.env.npm_package_version ?? "0.1.0",
      checks,
    };

    logger.info({ payload }, "Health check executed");

    return NextResponse.json(payload, {
      status: status === "ok" ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    return respondWithError(error);
  }
}
