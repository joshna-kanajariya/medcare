import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { logError } from './logger'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

// Error response formatter
interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  details?: unknown
}

export function formatErrorResponse(error: unknown): ErrorResponse {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return {
      error: 'Validation Error',
      message: 'Invalid input data',
      statusCode: 400,
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    }
  }

  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          error: 'Conflict Error',
          message: 'A record with this data already exists',
          statusCode: 409
        }
      case 'P2025':
        return {
          error: 'Not Found',
          message: 'The requested record was not found',
          statusCode: 404
        }
      default:
        logError('Prisma error', error)
        return {
          error: 'Database Error',
          message: 'A database error occurred',
          statusCode: 500
        }
    }
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    return {
      error: error.constructor.name,
      message: error.message,
      statusCode: error.statusCode
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    logError('Unexpected error', error)
    return {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
      statusCode: 500
    }
  }

  // Fallback for unknown error types
  logError('Unknown error type', error instanceof Error ? error : { error })
  return {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    statusCode: 500
  }
}

// API error handler wrapper
export function handleApiError(error: unknown): NextResponse {
  const errorResponse = formatErrorResponse(error)
  
  return NextResponse.json(errorResponse, {
    status: errorResponse.statusCode
  })
}

// Async handler wrapper for API routes
export function asyncHandler(
  handler: (req: Request, context?: unknown) => Promise<NextResponse>
) {
  return async (req: Request, context?: unknown): Promise<NextResponse> => {
    try {
      return await handler(req, context)
    } catch (error) {
      return handleApiError(error)
    }
  }
}