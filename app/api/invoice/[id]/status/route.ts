/**
 * GET /api/invoice/[id]/status
 * Poll for PDF generation status.
 * Returns current status and pdf_url when ready.
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
      return NextResponse.json(
        { error: 'Invoice not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        status: invoice.status,
        pdfUrl: invoice.pdf_url,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
