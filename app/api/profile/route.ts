/**
 * GET /api/profile   — return the authenticated freelancer's profile
 * PUT /api/profile   — partial update of profile fields
 *
 * Security: account_number is NEVER returned in any response.
 * Encryption: accountNumber is encrypted with AES-256-GCM before writing to DB.
 * Decryption: happens ONLY in lib/pdf — never here.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { query } from '@/lib/db'
import { encryptBankDetail } from '@/lib/encryption'
import { handleApiError } from '@/lib/errors'
import { updateProfileSchema } from '@/lib/validation/profile'
import { Freelancer, FreelancerProfile } from '@/lib/db/types'

// Strip account_number and password_hash from the profile before returning.
// This is enforced here and must never be bypassed.
function sanitiseProfile(freelancer: Freelancer): FreelancerProfile {
  // Destructure to explicitly exclude sensitive fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, account_number, ...profile } = freelancer
  return profile
}

// ─── GET ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const freelancer = await requireAuth(req)

    // Re-fetch to guarantee we have the latest data
    const result = await query<Freelancer>(
      'SELECT * FROM freelancers WHERE id = $1',
      [freelancer.id]
    )
    const row = result.rows[0]
    if (!row) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    return NextResponse.json({ data: sanitiseProfile(row) })
  } catch (err) {
    return handleApiError(err)
  }
}

// ─── PUT ────────────────────────────────────────────────────────────────────

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const freelancer = await requireAuth(req)

    // Validate input — all fields are optional (partial update)
    const body = await req.json()
    const input = updateProfileSchema.safeParse(body)
    if (!input.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    }

    const data = input.data
    const updatedFields: string[] = []

    // Build UPDATE SET clauses dynamically — only update provided fields
    const setClauses: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (data.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`)
      values.push(data.name)
      updatedFields.push('name')
    }
    if (data.phone !== undefined) {
      // Store null for empty string (data minimisation rule)
      setClauses.push(`phone = $${paramIndex++}`)
      values.push(data.phone || null)
      updatedFields.push('phone')
    }
    if (data.address !== undefined) {
      setClauses.push(`address = $${paramIndex++}`)
      values.push(data.address || null)
      updatedFields.push('address')
    }
    if (data.defaultCurrency !== undefined) {
      setClauses.push(`default_currency = $${paramIndex++}`)
      values.push(data.defaultCurrency)
      updatedFields.push('defaultCurrency')
    }
    if (data.bankName !== undefined) {
      setClauses.push(`bank_name = $${paramIndex++}`)
      values.push(data.bankName || null)
      updatedFields.push('bankName')
    }
    if (data.accountName !== undefined) {
      setClauses.push(`account_name = $${paramIndex++}`)
      values.push(data.accountName || null)
      updatedFields.push('accountName')
    }
    if (data.accountNumber !== undefined) {
      // Encrypt before storage — never store plaintext account numbers
      const encrypted = data.accountNumber
        ? encryptBankDetail(data.accountNumber)
        : null
      setClauses.push(`account_number = $${paramIndex++}`)
      values.push(encrypted)
      updatedFields.push('accountNumber')
    }

    // Nothing to update — return early
    if (setClauses.length === 0) {
      return NextResponse.json(
        { data: { updated: true, fields: [] } },
        { status: 200 }
      )
    }

    // Always update updated_at
    setClauses.push(`updated_at = now()`)

    values.push(freelancer.id)
    const whereClause = `WHERE id = $${paramIndex}`

    await query(
      `UPDATE freelancers SET ${setClauses.join(', ')} ${whereClause}`,
      values
    )

    // Return updated fields list — never include account_number value
    return NextResponse.json({
      data: { updated: true, fields: updatedFields },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
