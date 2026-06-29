/**
 * lib/validation/index.ts
 * Base Zod schemas reused across all API routes.
 * Validate at the API boundary — never rely on client-supplied values.
 */

import { z } from 'zod'

// The only currencies supported in v1.0
export const SUPPORTED_CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR'] as const
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export const currencySchema = z.enum(SUPPORTED_CURRENCIES, {
  errorMap: () => ({
    message: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}.`,
  }),
})

// Email — optional in some contexts (e.g. client email on invoice)
export const emailSchema = z
  .string()
  .email({ message: 'Please enter a valid email address.' })

export const optionalEmailSchema = z
  .string()
  .email({ message: 'That email address does not look right.' })
  .optional()
  .or(z.literal(''))
  .transform((v) => (v === '' ? undefined : v))

// Amounts must be positive finite numbers
// Never accept subtotal, vat_amount, balance_due, or line_total from the client
export const positiveAmountSchema = z
  .number({ invalid_type_error: 'Amount must be a number.' })
  .positive({ message: 'Amount must be greater than zero.' })
  .finite({ message: 'Amount must be a valid number.' })

// Password: minimum 8 characters
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters.' })

// Non-empty string helper
export const nonEmptyStringSchema = z
  .string()
  .min(1, { message: 'This field is required.' })
  .transform((s) => s.trim())
