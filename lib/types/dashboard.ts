
/**
 * Shared dashboard types.
 */

export interface DashboardStats {
  totalInvoices: number
  revenue: number
  outstanding: number
  defaultCurrency: string
}

export interface InvoiceSummary {
  id: string
  invoice_number: string
  client_name: string | null
  total_amount: number
  currency: string
  status: 'draft' | 'sent' | 'error'
  pdf_url: string | null
  created_at: string
}

