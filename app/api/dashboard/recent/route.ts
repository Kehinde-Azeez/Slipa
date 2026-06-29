import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const freelancer = await requireAuth(req)

    const result = await query(
      `
     SELECT
  id,
  invoice_number,
  total_amount,
  currency,
  status,
  pdf_url,
  created_at
      FROM invoices
      WHERE freelancer_id = $1
      ORDER BY created_at DESC
      LIMIT 5
      `,
      [freelancer.id]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('[Recent Invoices]', error)

    return NextResponse.json(
      { error: 'Unable to load recent invoices.' },
      { status: 500 }
    )
  }
}