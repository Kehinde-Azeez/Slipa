/**
 * lib/validation/invoice.ts
 * Zod schema for the DraftInvoice submitted to POST /api/invoice/generate.
 *
 * CRITICAL: Never accept lineTotal, subtotal, vatAmount, totalAmount, or
 * balanceDue from the client. These are computed server-side only.
 */

import { z } from 'zod'
import { currencySchema, positiveAmountSchema, optionalEmailSchema } from './index'

const lineItemSchema = z.object({
  description: z
    .string()
    .min(1, { message: 'Service description is required.' })
    .max(500),
  quantity: z
    .number()
    .positive({ message: 'Quantity must be greater than zero.' })
    .finite(),
  unitPrice: positiveAmountSchema,
  // Reject any client-supplied calculated fields
  lineTotal: z.never().optional(),
})

export const draftInvoiceSchema = z.object({
  clientName: z
    .string()
    .min(1, { message: 'Client name is required.' })
    .max(200),
  clientEmail: optionalEmailSchema,
  lineItems: z
    .array(lineItemSchema)
    .min(1, { message: 'At least one service item is required.' })
    .max(50),
  currency: currencySchema,
  amountPaid: z.number().min(0).finite().optional(),
  paymentTerms: z.string().max(500).optional(),
  vatOptIn: z.boolean().optional().default(false),
  discountAmount: z.number().min(0).finite().optional(),
  notes: z.string().max(1000).optional(),

  // Explicitly reject client-computed totals
  subtotal: z.never().optional(),
  vatAmount: z.never().optional(),
  totalAmount: z.never().optional(),
  balanceDue: z.never().optional(),
})

export type DraftInvoiceInput = z.infer<typeof draftInvoiceSchema>
