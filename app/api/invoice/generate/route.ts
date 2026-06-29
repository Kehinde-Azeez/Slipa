/**
 * POST /api/invoice/generate
 * Validate draft invoice, reserve number atomically, persist to DB,
 * enqueue PDF generation async (non-blocking via setImmediate).
 *
 * Returns immediately with { invoiceId, invoiceNumber, status: 'generating' }.
 * Client polls GET /api/invoice/[id]/status for completion.
 */

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { requireAuth } from '@/lib/auth'
import { query } from '@/lib/db'
import { reserveInvoiceNumber } from '@/lib/db/invoice-counter'
import { calculateInvoice } from '@/lib/invoice/calculate'
import { handleApiError, AppError } from '@/lib/errors'
import { draftInvoiceSchema } from '@/lib/validation/invoice'
import { getSession, upsertSession } from '@/lib/ai/session'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Auth first
    const freelancer = await requireAuth(req)

    // 2. Guard: prevent starting a new invoice if one is already in progress
    const session = getSession(freelancer.id)
    if (session?.activeInvoiceId) {
      return NextResponse.json(
        {
          error:
            'Your last invoice is still generating. Download it first before creating a new one.',
        },
        { status: 409 }
      )
    }

    // 3. Guard: must have gone through confirmation flow
    if (session && !session.awaitingConfirmation) {
      return NextResponse.json(
        { error: 'Please confirm your invoice summary before generating.' },
        { status: 400 }
      )
    }

    // 4. Validate full DraftInvoice with Zod
    // We read directly from the session instead of trusting a client payload
    const draftFromSession = (session?.draftInvoice as Record<string, any>) || {}
    
    // The chat mock engine stores fields flat, but the validation schema requires a lineItems array
    const payload = {
      ...draftFromSession,
      lineItems: draftFromSession.lineItems?.length ? draftFromSession.lineItems : [
        {
          description: draftFromSession.description,
          quantity: draftFromSession.quantity,
          unitPrice: draftFromSession.unitPrice,
        }
      ]
    }

    const input = draftInvoiceSchema.safeParse(payload)
    if (!input.success) {
      console.error('[Generate API] Validation error:', input.error.format())
      return NextResponse.json({ error: 'Invalid invoice data in session.' }, { status: 400 })
    }

    const draft = input.data

    // 5. Atomically reserve invoice number (SELECT ... FOR UPDATE inside transaction)
    const invoiceNumber = await reserveInvoiceNumber(freelancer.id)

    // 6. Compute all monetary values server-side — never from client
    const calc = calculateInvoice(draft)

    // 7. Upsert client record
    let clientId: string | null = null
    if (draft.clientName) {
      const clientResult = await query<{ id: string }>(
        `INSERT INTO clients (id, freelancer_id, name, email)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          randomUUID(),
          freelancer.id,
          draft.clientName,
          draft.clientEmail ?? null,
        ]
      )
      clientId = clientResult.rows[0]?.id ?? null
    }

    // 8. INSERT invoice row with status: draft
    const invoiceId = randomUUID()
    await query(
      `INSERT INTO invoices (
         id, freelancer_id, client_id, invoice_number, currency,
         subtotal, discount_amount, vat_amount, total_amount,
         amount_paid, balance_due, payment_terms, notes, status, due_date
       ) VALUES (
         $1, $2, $3, $4, $5,
         $6, $7, $8, $9,
         $10, $11, $12, $13, 'draft', CURRENT_DATE
       )`,
      [
        invoiceId,
        freelancer.id,
        clientId,
        invoiceNumber,
        draft.currency,
        calc.subtotal,
        calc.discountAmount,
        calc.vatAmount,
        calc.totalAmount,
        draft.amountPaid ?? 0,
        calc.balanceDue,
        draft.paymentTerms ?? '50% upfront, balance on delivery',
        draft.notes ?? null,
      ]
    )

    // 9. INSERT line item rows
    for (const item of calc.lineItems) {
      await query(
        `INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          randomUUID(),
          invoiceId,
          item.description,
          item.quantity,
          item.unitPrice,
          item.lineTotal,
        ]
      )
    }

    // 10. Update session — mark active invoice so no second generation starts
    if (session) {
      upsertSession(freelancer.id, { activeInvoiceId: invoiceId })
    }

    // 11. Generate PDF synchronously before responding
    //     Next.js suspends detached background tasks, so we must await it to guarantee execution
    try {
      const { generateAndStorePdf } = await import('@/lib/pdf/generate')
      await generateAndStorePdf(invoiceId, freelancer.id)
      
      // Clear the activeInvoiceId lock so the user can continue chatting
      if (session) {
        upsertSession(freelancer.id, { activeInvoiceId: undefined })
      }
    } catch (err) {
      console.error('[PDF Generation Error]:', err)
      await query(
        "UPDATE invoices SET status = 'error' WHERE id = $1",
        [invoiceId]
      )
      // Return 500 if we couldn't generate the PDF
      return NextResponse.json(
        { error: 'Failed to generate PDF. Please try again.' },
        { status: 500 }
      )
    }

    // 12. PDF is complete — return 200 with invoiceId so client can poll/download
    return NextResponse.json(
      { data: { invoiceId, invoiceNumber, status: 'ready' } },
      { status: 200 }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
