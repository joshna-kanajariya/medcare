import "server-only";

import pino from "pino";

import { env, isDev } from "./env";

type LogContext = Record<string, unknown>;

type LogPayload = LogContext | undefined;

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    app: "medcare",
    env: env.NODE_ENV,
  },
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});

const normalizeContext = (context?: LogContext) => context ?? {};

export const logInfo = (message: string, context?: LogPayload) => {
  logger.info(normalizeContext(context), message);
};

export const logError = (
  message: string,
  error?: Error | LogContext,
) => {
  if (error instanceof Error) {
    logger.error(
      {
        err: error,
        stack: error.stack,
        message: error.message,
      },
      message,
    );
    return;
  }

  logger.error(normalizeContext(error), message);
};

export const logWarning = (message: string, context?: LogPayload) => {
  logger.warn(normalizeContext(context), message);
};

export const logDebug = (message: string, context?: LogPayload) => {
  logger.debug(normalizeContext(context), message);
};
