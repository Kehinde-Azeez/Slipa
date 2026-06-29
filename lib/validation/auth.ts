/**
 * lib/validation/auth.ts
 * Zod schemas for registration and login inputs.
 * Validated at the API boundary only — never in components.
 */

import { z } from 'zod'
import { emailSchema, passwordSchema } from './index'

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
