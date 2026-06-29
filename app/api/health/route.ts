/**
 * GET /api/health
 *
 * Development-only health endpoint.
 *
 * Checks:
 * - Required environment variables
 * - Database connectivity
 * - Required database tables
 * - Encryption key validity
 *
 * IMPORTANT:
 * This endpoint should be removed or protected before production.
 */

import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {}

  // Required environment variables for the CURRENT mock-AI architecture.
  checks.env = {
    ok:
      Boolean(process.env.DATABASE_URL) &&
      Boolean(process.env.JWT_SECRET) &&
      Boolean(process.env.BANK_ENCRYPTION_KEY),

    detail: [
      process.env.DATABASE_URL
        ? '✓ DATABASE_URL'
        : '✗ DATABASE_URL missing',

      process.env.JWT_SECRET
        ? '✓ JWT_SECRET'
        : '✗ JWT_SECRET missing',

      process.env.BANK_ENCRYPTION_KEY
        ? '✓ BANK_ENCRYPTION_KEY'
        : '✗ BANK_ENCRYPTION_KEY missing',
    ].join(' | '),
  }

  // Database connection
  try {
    const result = await query<{ table_name: string }>(
      `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
      AND table_name IN (
        'freelancers',
        'clients',
        'invoices',
        'line_items'
      )
      ORDER BY table_name
      `
    )

    const found = result.rows.map((r) => r.table_name)

    const required = [
      'clients',
      'freelancers',
      'invoices',
      'line_items',
    ]

    const missing = required.filter((t) => !found.includes(t))

    checks.database = {
      ok: missing.length === 0,

      detail:
        missing.length === 0
          ? `✓ All tables present: ${found.join(', ')}`
          : `✗ Missing tables: ${missing.join(', ')}`,
    }
  } catch (err) {
    checks.database = {
      ok: false,

      detail: `✗ Connection failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
    }
  }

  // Encryption key length
  if (process.env.BANK_ENCRYPTION_KEY) {
    const keyLength = Buffer.from(
      process.env.BANK_ENCRYPTION_KEY,
      'hex'
    ).length

    checks.encryption = {
      ok: keyLength === 32,

      detail:
        keyLength === 32
          ? '✓ BANK_ENCRYPTION_KEY is 32 bytes'
          : `✗ BANK_ENCRYPTION_KEY is ${keyLength} bytes (must be exactly 32 bytes / 64 hex characters)`,
    }
  }

  const allOk = Object.values(checks).every((c) => c.ok)

  return NextResponse.json(
    {
      ok: allOk,
      checks,
    },
    {
      status: allOk ? 200 : 503,
    }
  )
}