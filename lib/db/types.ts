/**
 * lib/db/types.ts
 * Shared TypeScript types that match the database schema.
 * Named after DB columns (snake_case) to match PostgreSQL exactly.
 */

export interface Freelancer {
  id: string
  name: string
  email: string
  password_hash: string
  phone: string | null
  address: string | null
  default_currency: 'NGN' | 'USD' | 'GBP' | 'EUR'
  bank_name: string | null
  account_name: string | null
  account_number: string | null   // always encrypted — never plaintext outside lib/pdf
  invoice_counter: number
  invoice_counter_year: number
  created_at: Date
  updated_at: Date
}

// Profile returned to the client — account_number is always stripped
export type FreelancerProfile = Omit<Freelancer, 'password_hash' | 'account_number'>

export interface Invoice {
  id: string
  freelancer_id: string
  client_id: string | null
  invoice_number: string
  currency: 'NGN' | 'USD' | 'GBP' | 'EUR'
  subtotal: number
  discount_amount: number
  vat_amount: number
  total_amount: number
  amount_paid: number
  balance_due: number
  payment_terms: string | null
  notes: string | null
  status: 'draft' | 'sent' | 'error'
  pdf_url: string | null
  created_at: Date
  updated_at: Date
}

export interface LineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  line_total: number
}

export interface Client {
  id: string
  freelancer_id: string
  name: string
  email: string | null
  created_at: Date
}

// Draft invoice shape built up during the AI conversation
export interface DraftInvoice {
  clientName: string
  clientEmail?: string
  lineItems: { description: string; quantity: number; unitPrice: number }[]
  currency: 'NGN' | 'USD' | 'GBP' | 'EUR'
  amountPaid?: number
  paymentTerms?: string
  vatOptIn?: boolean
  discountAmount?: number
  notes?: string
}

// Invoice calculation result — always server-computed
export interface InvoiceCalculation {
  lineItems: { description: string; quantity: number; unitPrice: number; lineTotal: number }[]
  subtotal: number
  discountAmount: number
  vatAmount: number
  totalAmount: number
  balanceDue: number
}
