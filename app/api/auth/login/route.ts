/**
 * POST /api/auth/login
 * Verify credentials, issue JWT.
 * CRITICAL: Return identical error message for wrong email OR wrong password.
 * Never distinguish between the two — this prevents account enumeration.
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { loginSchema } from '@/lib/validation/auth'
import { Freelancer } from '@/lib/db/types'

// Identical message for both "email not found" and "wrong password"
// This is intentional — never change to distinguish the two cases
const AUTH_FAILED_MESSAGE = 'Invalid email or password.'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Validate input shape
    const body = await req.json()
    const input = loginSchema.safeParse(body)
    if (!input.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    }

    const { email, password } = input.data

    // 2. Look up freelancer by email
    const result = await query<Freelancer>(
      'SELECT * FROM freelancers WHERE email = $1',
      [email.toLowerCase()]
    )
    const freelancer = result.rows[0]

    // 3. If not found — return generic error (do not reveal email existence)
    if (!freelancer) {
      // Perform a dummy bcrypt compare to prevent timing attacks that reveal
      // whether the email exists based on response time difference
      await bcrypt.compare(password, '$2b$12$invalidhashusedtopreventimingtimingattacksXXXXXXXXXXXXXXX')
      return NextResponse.json({ error: AUTH_FAILED_MESSAGE }, { status: 401 })
    }

    // 4. Compare password
    const passwordMatch = await bcrypt.compare(password, freelancer.password_hash)
    if (!passwordMatch) {
      return NextResponse.json({ error: AUTH_FAILED_MESSAGE }, { status: 401 })
    }

    // 5. Issue JWT in HttpOnly cookie
    const token = await signToken(freelancer.id)
    const response = NextResponse.json(
      { data: { freelancerId: freelancer.id } },
      { status: 200 }
    )
    setAuthCookie(response, token)

    return response
  } catch (err) {
    return handleApiError(err)
  }
}
