/**
 * GET /api/dashboard/invoices
 * Returns a paginated list of invoices for the authenticated freelancer.
 *
 * SECURITY: requireAuth is mandatory — this route previously had no auth guard.
 * All queries are scoped to freelancer_id from the verified JWT, never from the client.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { query } from '@/lib/db'
import { handleApiError } from '@/lib/errors'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const freelancer = await requireAuth(req)

    const result = await query(
      `SELECT
         invoices.id,
         invoices.invoice_number,
         invoices.total_amount,
         invoices.currency,
         invoices.status,
         invoices.pdf_url,
         invoices.created_at,
         clients.name AS client_name
       FROM invoices
       LEFT JOIN clients ON clients.id = invoices.client_id
       WHERE invoices.freelancer_id = $1
       ORDER BY invoices.created_at DESC`,
      [freelancer.id]
    )

    return NextResponse.json(result.rows)
  } catch (err) {
    return handleApiError(err)
  }
}
