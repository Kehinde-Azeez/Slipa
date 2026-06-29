/**
 * GET /api/invoice/[id]/download
 * Return the signed PDF download URL for an invoice.
 * Verifies the invoice belongs to the authenticated freelancer (IDOR prevention).
 * URL is time-limited: stored with 24h expiry in the pdf_url field.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { query } from '@/lib/db'
import { handleApiError } from '@/lib/errors'

interface RouteParams {
  params: { id: string }
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const freelancer = await requireAuth(req)

    const result = await query<{
      id: string
      status: string
      pdf_url: string | null
      invoice_number: string
    }>(
      `SELECT id, status, pdf_url, invoice_number
       FROM invoices
       WHERE id = $1 AND freelancer_id = $2`,
      [params.id, freelancer.id]
    )

    const invoice = result.rows[0]
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
    }

    if (invoice.status === 'draft' || invoice.status === 'error') {
      return NextResponse.json(
        { error: 'PDF is not ready yet.' },
        { status: 404 }
      )
    }

    if (!invoice.pdf_url) {
      return NextResponse.json(
        { error: 'PDF is not ready yet.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        downloadUrl: invoice.pdf_url,
        invoiceNumber: invoice.invoice_number,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
