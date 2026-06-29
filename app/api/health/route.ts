/**
 * GET /api/health
 * Diagnostic endpoint — tests DB connection and env var presence.
 * Returns JSON with status of each dependency.
 * REMOVE or gate behind auth before production deployment.
 */

import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {}

  // 1. Check required env vars are set (not their values)
  checks.env = {
    ok:
      Boolean(process.env.DATABASE_URL) &&
      Boolean(process.env.JWT_SECRET) &&
      Boolean(process.env.BANK_ENCRYPTION_KEY) &&
      Boolean(process.env.GEMINI_API_KEY),
    detail: [
      process.env.DATABASE_URL ? '✓ DATABASE_URL' : '✗ DATABASE_URL missing',
      process.env.JWT_SECRET ? '✓ JWT_SECRET' : '✗ JWT_SECRET missing',
      process.env.BANK_ENCRYPTION_KEY
        ? '✓ BANK_ENCRYPTION_KEY'
        : '✗ BANK_ENCRYPTION_KEY missing',
      process.env.GEMINI_API_KEY
        ? '✓ GEMINI_API_KEY'
        : '✗ GEMINI_API_KEY missing',
    ].join(' | '),
  }

  // 2. Test database connection and schema
  try {
    const result = await query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public'
       AND table_name IN ('freelancers', 'clients', 'invoices', 'line_items')
       ORDER BY table_name`
    )
    const found = result.rows.map((r) => r.table_name)
    const required = ['clients', 'freelancers', 'invoices', 'line_items']
    const missing = required.filter((t) => !found.includes(t))

    checks.database = {
      ok: missing.length === 0,
      detail:
        missing.length === 0
          ? `✓ All tables present: ${found.join(', ')}`
          : `✗ Missing tables: ${missing.join(', ')} — run migrations 001–004`,
    }
  } catch (err) {
    checks.database = {
      ok: false,
      detail: `✗ Connection failed: ${err instanceof Error ? err.message : String(err)}`,
    }
  }

  // 3. Check BANK_ENCRYPTION_KEY length
  if (process.env.BANK_ENCRYPTION_KEY) {
    const keyLen = Buffer.from(process.env.BANK_ENCRYPTION_KEY, 'hex').length
    checks.encryption = {
      ok: keyLen === 32,
      detail:
        keyLen === 32
          ? '✓ BANK_ENCRYPTION_KEY is 32 bytes'
          : `✗ BANK_ENCRYPTION_KEY is ${keyLen} bytes — must be exactly 32 bytes (64 hex chars)`,
    }
  }

  const allOk = Object.values(checks).every((c) => c.ok)

  return NextResponse.json(
    { ok: allOk, checks },
    { status: allOk ? 200 : 503 }
  )
}
