
'use client'

import { formatCurrency } from '@/lib/utils'
import type { InvoiceSummary } from '@/lib/types/dashboard'

interface InvoiceTableProps {
  invoices: InvoiceSummary[]
}

const STATUS_STYLES: Record<string, string> = {
  sent:  'bg-success-bg text-success',
  draft: 'bg-warning-bg text-warning',
  error: 'bg-error-bg text-error',
}

export default function InvoiceTable({
  invoices,
}: InvoiceTableProps) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="border-b border-border bg-surface-alt">
          <tr>
            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-text-muted">
              Invoice
            </th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-text-muted">
              Client
            </th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-text-muted">
              Date
            </th>
            <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-widest text-text-muted">
              Amount
            </th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-text-muted">
              Status
            </th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-text-muted">
              PDF
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="hover:bg-surface-alt transition-colors"
            >
              <td className="px-6 py-4 font-medium text-text-primary">
                {invoice.invoice_number}
              </td>

              <td className="px-6 py-4 text-text-secondary">
                {invoice.client_name ?? '—'}
              </td>

              <td className="px-6 py-4 text-text-muted">
                {new Date(invoice.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>

              <td className="px-6 py-4 text-right font-semibold tabular-nums text-text-primary">
                {formatCurrency(invoice.total_amount, invoice.currency)}
              </td>

              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    STATUS_STYLES[invoice.status] ?? ''
                  }`}
                >
                  {invoice.status}
                </span>
              </td>

              <td className="px-6 py-4">
                {invoice.pdf_url ? (
                  <a
                    href={invoice.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-green hover:text-brand-green-dark font-medium transition-colors"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-text-muted">Processing…</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
