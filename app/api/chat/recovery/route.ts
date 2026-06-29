/**
 * GET /api/chat/recovery
 * Check whether the authenticated freelancer has a recoverable draft session.
 * Called on chat page mount.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { checkSessionRecovery } from '@/lib/session/recovery'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const freelancer = await requireAuth(req)
    const hasRecoverableSession = checkSessionRecovery(freelancer.id)
    return NextResponse.json({ data: { hasRecoverableSession } })
  } catch (err) {
    return handleApiError(err)
  }
}
