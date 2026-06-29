/**
 * lib/db/invoice-counter.ts
 * Atomic invoice number reservation.
 *
 * Uses SELECT ... FOR UPDATE inside a transaction to prevent concurrent
 * duplicate invoice numbers. This is the ONLY place the counter is incremented.
 * Never call this from outside this module.
 *
 * Format: INV-YYYY-XXX (e.g. INV-2026-001)
 * Counter resets to 1 on January 1 each year.
 * Failed PDF generation does NOT reuse the reserved number — gaps are acceptable.
 */

import { withTransaction } from '@/lib/db'

export async function reserveInvoiceNumber(freelancerId: string): Promise<string> {
  return withTransaction(async (client) => {
    // Lock the freelancer row to prevent concurrent counter increments
    const lockResult = await client.query<{
      invoice_counter: number
      invoice_counter_year: number
    }>(
      'SELECT invoice_counter, invoice_counter_year FROM freelancers WHERE id = $1 FOR UPDATE',
      [freelancerId]
    )

    if (lockResult.rows.length === 0) {
      throw new Error('Freelancer not found during invoice number reservation.')
    }

    const row = lockResult.rows[0]
    const currentYear = new Date().getFullYear()
    let counter = row.invoice_counter
    let year = row.invoice_counter_year

    // Reset counter on year rollover (January 1)
    if (year !== currentYear) {
      counter = 0
      year = currentYear
    }

    // Increment counter
    counter += 1

    // Persist back within the same transaction
    await client.query(
      'UPDATE freelancers SET invoice_counter = $1, invoice_counter_year = $2 WHERE id = $3',
      [counter, year, freelancerId]
    )

    // Return formatted invoice number: INV-2026-001
    return `INV-${year}-${String(counter).padStart(3, '0')}`
  })
}
