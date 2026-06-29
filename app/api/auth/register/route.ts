/**
 * POST /api/auth/register
 * Create a new freelancer account, hash password, issue JWT.
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { registerSchema } from '@/lib/validation/auth'
import { Freelancer } from '@/lib/db/types'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Validate input
    const body = await req.json()
    const input = registerSchema.safeParse(body)
    if (!input.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    }

    const { email, password } = input.data

    // 2. Check email uniqueness
    const existing = await query(
      'SELECT id FROM freelancers WHERE email = $1',
      [email.toLowerCase()]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'That email is already registered. Log in instead?' },
        { status: 409 }
      )
    }

    // 3. Hash password — cost factor 12 (security rule)
    const password_hash = await bcrypt.hash(password, 12)

    // 4. Insert freelancer row
    // name defaults to empty — AI assistant collects it in first chat
    const result = await query<Freelancer>(
      `INSERT INTO freelancers
         (email, password_hash, name, default_currency)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [email.toLowerCase(), password_hash, '', 'NGN']
    )
    const freelancer = result.rows[0]

    // 5. Sign JWT and set HttpOnly cookie
    const token = await signToken(freelancer.id)
    const response = NextResponse.json(
      { data: { freelancerId: freelancer.id } },
      { status: 201 }
    )
    setAuthCookie(response, token)

    return response
  } catch (err) {
    return handleApiError(err)
  }
}
