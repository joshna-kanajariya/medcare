import { NextResponse } from "next/server";
import { performance } from "perf_hooks";

import { asyncHandler } from "@/lib/errors";
import { logError, logInfo } from "@/lib/logger";
import { pingDatabase } from "@/lib/mysql";
import { prisma } from "@/lib/prisma";
import type { HealthCheckResponse } from "@/types";

async function databaseHealthHandler(): Promise<NextResponse> {
  const started = performance.now();

  try {
    const mysqlPing = await pingDatabase();
    const prismaStarted = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const prismaLatency = Math.round(performance.now() - prismaStarted);

    const responseTime = Math.round(performance.now() - started);

    const healthData: HealthCheckResponse = {
      status: mysqlPing.latencyMs < 1000 ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: true,
        responseTime,
        mysqlLatencyMs: mysqlPing.latencyMs,
        prismaLatencyMs: prismaLatency,
      },
      version: process.env.npm_package_version || "1.0.0",
    };

    logInfo("Database health check successful", {
      mysqlLatencyMs: mysqlPing.latencyMs,
      prismaLatencyMs: prismaLatency,
      status: healthData.status,
    });

    return NextResponse.json(healthData, {
      status: healthData.status === "healthy" ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    const responseTime = Math.round(performance.now() - started);

    logError("Database health check failed", error instanceof Error ? error : { error });

    const healthData: HealthCheckResponse = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: false,
        responseTime,
      },
      version: process.env.npm_package_version || "1.0.0",
    };

    return NextResponse.json(healthData, {
      status: 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  }
}

export const GET = asyncHandler(databaseHealthHandler);