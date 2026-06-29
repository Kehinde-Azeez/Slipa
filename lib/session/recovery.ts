/**
 * lib/session/recovery.ts
 * Detect whether a recoverable draft session exists for the current freelancer.
 * Called on chat page mount after login.
 */

import { getSession } from '@/lib/ai/session'

/**
 * checkSessionRecovery — returns true if the freelancer has an unfinished
 * invoice draft that can be resumed.
 *
 * NOT recoverable if:
 * - No session exists (expired or never started)
 * - An invoice has already been committed (activeInvoiceId is set)
 *   — PDF may still be generating; that is handled by InvoiceDownloadButton
 */
export function checkSessionRecovery(freelancerId: string): boolean {
  const session = getSession(freelancerId)
  if (!session) return false

  // If invoice row already exists, PDF is in progress — not a draft recovery scenario
  if (session.activeInvoiceId) return false

  // Recoverable only if there are collected fields to resume
  const hasDraftData = Object.keys(session.draftInvoice).length > 0
  return hasDraftData
}
