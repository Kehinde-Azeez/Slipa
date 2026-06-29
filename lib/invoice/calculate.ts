/**
 * lib/invoice/calculate.ts
 * Server-side invoice calculations — never trust client-supplied totals.
 *
 * Uses integer arithmetic (cents) to avoid floating-point errors:
 * multiply to cents → compute → divide back to decimal.
 *
 * Never accept lineTotal, subtotal, vatAmount, totalAmount, or balanceDue from
 * the client. Always recompute from raw inputs.
 */

import { DraftInvoice, InvoiceCalculation } from '@/lib/db/types'

const CENTS = 100         // multiply by this to work in integer cents
const VAT_RATE = 0.075   // 7.5% Nigerian VAT

/**
 * Round to 2 decimal places using integer arithmetic to avoid float drift.
 */
function roundCents(value: number): number {
  return Math.round(value * CENTS) / CENTS
}

export function calculateInvoice(input: DraftInvoice): InvoiceCalculation {
  if (!input.lineItems || input.lineItems.length === 0) {
    throw new Error('Invoice must have at least one line item.')
  }

  // Compute line totals — server-side only
  const lineItems = input.lineItems.map((item) => {
    // Integer arithmetic: work in cents to avoid float errors
    const lineTotalCents = Math.round(item.quantity * item.unitPrice * CENTS)
    return {
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: lineTotalCents / CENTS,
    }
  })

  // Subtotal in cents
  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + Math.round(item.lineTotal * CENTS),
    0
  )
  const subtotal = subtotalCents / CENTS

  // Discount — default 0 if not provided
  const discountCents = Math.round((input.discountAmount ?? 0) * CENTS)
  const discountAmount = discountCents / CENTS

  // VAT — only if user explicitly opted in (hard constraint)
  const taxableAmountCents = subtotalCents - discountCents
  const vatAmountCents = input.vatOptIn
    ? Math.round(taxableAmountCents * VAT_RATE)
    : 0
  const vatAmount = vatAmountCents / CENTS

  // Total
  const totalAmountCents = taxableAmountCents + vatAmountCents
  const totalAmount = totalAmountCents / CENTS

  // Balance due
  const amountPaidCents = Math.round((input.amountPaid ?? 0) * CENTS)
  const balanceDueCents = totalAmountCents - amountPaidCents
  const balanceDue = balanceDueCents / CENTS

  return {
    lineItems,
    subtotal: roundCents(subtotal),
    discountAmount: roundCents(discountAmount),
    vatAmount: roundCents(vatAmount),
    totalAmount: roundCents(totalAmount),
    balanceDue: roundCents(balanceDue),
  }
}
