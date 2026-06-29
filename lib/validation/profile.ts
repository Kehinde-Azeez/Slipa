/**
 * lib/validation/profile.ts
 * Zod schema for profile update.
 * All fields are optional — PUT /api/profile accepts partial updates only.
 */

import { z } from 'zod'
import { currencySchema, optionalEmailSchema } from './index'

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name cannot be empty.' })
    .max(200)
    .optional(),
  phone: z
    .string()
    .max(30)
    .optional()
    .nullable(),
  address: z
    .string()
    .max(500)
    .optional()
    .nullable(),
  defaultCurrency: currencySchema.optional(),
  bankName: z
    .string()
    .max(200)
    .optional()
    .nullable(),
  accountName: z
    .string()
    .max(200)
    .optional()
    .nullable(),
  // accountNumber is treated specially — it is encrypted before DB storage
  // Never returned in any API response
  accountNumber: z
    .string()
    .max(30)
    .optional()
    .nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
