/**
 * lib/auth.ts
 * JWT authentication helpers.
 * JWT is stored in an HttpOnly, Secure, SameSite=Strict cookie only.
 * Never stored in localStorage, sessionStorage, or response body.
 */

import { SignJWT, jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Freelancer } from '@/lib/db/types'
import { AuthError } from '@/lib/errors'

const COOKIE_NAME = 'slipa_token'
const TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60 // 7 days

interface JWTPayload {
  freelancerId: string
  iat?: number
  exp?: number
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters.')
  }
  return new TextEncoder().encode(secret)
}

/**
 * Sign a new JWT and return the token string.
 * Embed only the freelancerId — never PII, never bank details.
 */
export async function signToken(freelancerId: string): Promise<string> {
  const secret = getJwtSecret()
  return new SignJWT({ freelancerId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY_SECONDS}s`)
    .sign(secret)
}

/**
 * Verify a JWT string and return the decoded payload.
 * Throws AuthError on invalid or expired tokens.
 */
async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const secret = getJwtSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch {
    // Do not distinguish between expired and invalid — both are the same to the client
    throw new AuthError('Session expired. Please log in again.')
  }
}

/**
 * requireAuth — middleware for all protected routes.
 * Reads JWT from HttpOnly cookie only. Throws AuthError if missing or invalid.
 * Returns the full Freelancer row for use in the route handler.
 */
export async function requireAuth(req: NextRequest): Promise<Freelancer> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    throw new AuthError('You need to log in to do that.')
  }

  const payload = await verifyToken(token)
  if (!payload.freelancerId) {
    throw new AuthError('Authentication required.')
  }

  const result = await query<Freelancer>(
    'SELECT * FROM freelancers WHERE id = $1',
    [payload.freelancerId]
  )
  const freelancer = result.rows[0]
  if (!freelancer) {
    throw new AuthError('Account not found.')
  }

  return freelancer
}

/**
 * setAuthCookie — attach JWT to the response as an HttpOnly cookie.
 * Call this after successful register or login.
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY_SECONDS,
    path: '/',
  })
}

/**
 * clearAuthCookie — remove the JWT cookie on logout.
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
}
