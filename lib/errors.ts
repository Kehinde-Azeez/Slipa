/**
 * lib/errors.ts
 * Central error handler for all API routes.
 * Never expose raw error messages or stack traces to clients.
 * Log with correlation IDs — never log PII or bank details.
 */

import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class AuthError extends AppError {
  constructor(message = 'You need to log in to do that.') {
    super(message, 401)
    this.name = 'AuthError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'That resource does not exist.') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid input.') {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

/**
 * handleApiError — used as the catch handler in every API route.
 * Maps known error types to appropriate HTTP responses.
 * Logs unknown errors with a correlation ID (no PII).
 */
export function handleApiError(err: unknown): NextResponse {
  const correlationId = randomUUID()

  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: 'Invalid input.' },
      { status: 400 }
    )
  }

  if (err instanceof AuthError) {
    return NextResponse.json(
      { error: err.message },
      { status: 401 }
    )
  }

  if (err instanceof NotFoundError) {
    return NextResponse.json(
      { error: err.message },
      { status: 404 }
    )
  }

  if (err instanceof AppError) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode }
    )
  }

  // Unknown error — log correlation ID in production, full detail in development
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    console.error(`[api] Unhandled error. correlationId=${correlationId}`, err)
  } else {
    console.error(`[api] Unhandled error. correlationId=${correlationId}`)
  }
  return NextResponse.json(
    { error: 'Something went wrong. Please try again.' },
    { status: 500 }
  )
}
