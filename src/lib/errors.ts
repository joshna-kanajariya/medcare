import "server-only";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { logger } from "./logger";

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor({
    message,
    status = 500,
    code = "INTERNAL_ERROR",
    details,
    cause,
  }: {
    message: string;
    status?: number;
    code?: string;
    details?: unknown;
    cause?: unknown;
  }) {
    super(message, { cause });
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new AppError({
      message: "Validation failed",
      status: 400,
      code: "BAD_REQUEST",
      details: error.flatten(),
      cause: error,
    });
  }

  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return new AppError({
          message: "Unique constraint violation",
          status: 409,
          code: "CONFLICT",
          details: { target: error.meta?.target },
          cause: error,
        });
      case "P2025":
        return new AppError({
          message: "Requested record was not found",
          status: 404,
          code: "NOT_FOUND",
          cause: error,
        });
      default:
        return new AppError({
          message: "Database request failed",
          status: 500,
          code: "DATABASE_ERROR",
          details: { code: error.code, meta: error.meta },
          cause: error,
        });
    }
  }

  if (error instanceof Error) {
    return new AppError({
      message: error.message,
      status: 500,
      code: "UNEXPECTED_ERROR",
      cause: error,
    });
  }

  return new AppError({
    message: "An unknown error occurred",
    status: 500,
    code: "UNKNOWN",
    details: error,
  });
};

export const respondWithError = (error: unknown) => {
  const normalized = normalizeError(error);

  logger.error(
    {
      error: {
        name: normalized.name,
        message: normalized.message,
        code: normalized.code,
        status: normalized.status,
        details: normalized.details,
      },
    },
    "Request failed",
  );

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: normalized.code,
        message: normalized.message,
        details: normalized.details,
      },
    },
    { status: normalized.status },
  );
};

export const asyncHandler = <T extends (...args: unknown[]) => Promise<NextResponse>>(
  handler: T,
) => {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return respondWithError(error);
    }
  }) as T;
};
