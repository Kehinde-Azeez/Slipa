/**
 * POST /api/auth/logout
 * Clear the JWT cookie to end the session.
 * Requires auth — prevents CSRF-based logout attacks.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { clearAuthCookie } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate the user is actually logged in before clearing cookie
    await requireAuth(req)

    const response = NextResponse.json(
      { data: { loggedOut: true } },
      { status: 200 }
    )
    clearAuthCookie(response)
    return response
  } catch (err) {
    return handleApiError(err)
  }
}
