/**
 * lib/ai/session.ts
 * In-memory session store for active AI conversations.
 * Keyed by freelancerId. One active session per account.
 * Sessions expire after 5 minutes of inactivity (checked lazily on read).
 *
 * v1.0: in-memory Map. For horizontal scaling, replace with Redis (see SKILL.md).
 * NEVER store sensitive data in session: no bank account numbers, no passwords.
 */

import { DraftInvoice } from '@/lib/db/types'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface SessionState {
  freelancerId: string
  profileComplete: boolean
  conversationHistory: Message[]
  draftInvoice: Partial<DraftInvoice>
  awaitingConfirmation: boolean
  activeInvoiceId?: string    // set once invoice row is inserted — clears on completion
  lastActivityAt: number      // Unix ms timestamp — used for expiry
}

// 5 minutes in milliseconds
const SESSION_TTL_MS = 5 * 60 * 1_000

// Singleton in-memory store — persists across requests within a single server process
// In dev mode, Next.js clears module caches, so we must use globalThis
const globalForSessions = globalThis as unknown as {
  sessions: Map<string, SessionState> | undefined
}

const sessions = globalForSessions.sessions ?? new Map<string, SessionState>()
if (process.env.NODE_ENV !== 'production') {
  globalForSessions.sessions = sessions
}

function defaultSession(freelancerId: string): SessionState {
  return {
    freelancerId,
    profileComplete: false,
    conversationHistory: [],
    draftInvoice: {},
    awaitingConfirmation: false,
    lastActivityAt: Date.now(),
  }
}

/**
 * getSession — returns the session if it exists and has not expired.
 * Expired sessions are deleted on read (lazy expiry — no background sweep needed in v1.0).
 */
export function getSession(freelancerId: string): SessionState | null {
  const session = sessions.get(freelancerId)
  if (!session) return null

  // Check expiry
  if (Date.now() - session.lastActivityAt > SESSION_TTL_MS) {
    sessions.delete(freelancerId)
    return null
  }

  // Refresh lastActivityAt on every successful read
  session.lastActivityAt = Date.now()
  return session
}

/**
 * upsertSession — create or update a session.
 * Always updates lastActivityAt to now.
 */
export function upsertSession(
  freelancerId: string,
  updates: Partial<SessionState>
): SessionState {
  const existing = getSession(freelancerId)
  const next: SessionState = {
    ...(existing ?? defaultSession(freelancerId)),
    ...updates,
    lastActivityAt: Date.now(),
  }

  // Cap conversation history at 20 turns in memory (send only last 10 to LLM)
  if (next.conversationHistory.length > 20) {
    next.conversationHistory = next.conversationHistory.slice(-20)
  }

  sessions.set(freelancerId, next)
  return next
}

/**
 * clearSession — remove the session entirely.
 * Called after invoice generation completes or user chooses Start Fresh.
 */
export function clearSession(freelancerId: string): void {
  sessions.delete(freelancerId)
}

/**
 * Build the context block injected into every AI call.
 * Tells the model what fields are already collected so it never re-asks.
 */
export function buildContextBlock(session: SessionState): string {
  return `
CURRENT SESSION STATE:
${JSON.stringify(session.draftInvoice, null, 2)}
Do not ask for any field already present above.
`.trim()
}

/**
 * getLast10Turns — returns the last 10 conversation turns to send to the LLM.
 * Reduces token cost while preserving recent context.
 */
export function getLast10Turns(session: SessionState): Message[] {
  return session.conversationHistory.slice(-10)
}
