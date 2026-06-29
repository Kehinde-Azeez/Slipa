/**
 * DELETE /api/chat/session
 * Clear the in-memory session for the authenticated freelancer.
 * Called when user chooses "Start fresh" from the SESSION_RECOVERY prompt.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { clearSession } from '@/lib/ai/session'

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const freelancer = await requireAuth(req)
    clearSession(freelancer.id)
    return NextResponse.json({ data: { cleared: true } })
  } catch (err) {
    return handleApiError(err)
  }
}
