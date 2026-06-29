import Link from 'next/link'
import EmptyState from './EmptyState'
import { formatCurrency } from '@/lib/utils'

interface RecentInvoice {
  id: string
  invoice_number: string
  total_amount: number
  currency: string
  status: 'draft' | 'sent' | 'error'
  pdf_url: string | null
  created_at: string
}

interface RecentInvoicesProps {
  invoices: RecentInvoice[]
  isLoading?: boolean
}

const STATUS_STYLES: Record<string, string> = {
  sent:  'bg-success-bg text-success',
  draft: 'bg-warning-bg text-warning',
  error: 'bg-error-bg text-error',
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div className="space-y-2">
        <div className="h-4 w-28 animate-pulse rounded bg-surface-muted" />
        <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-4 w-20 animate-pulse rounded bg-surface-muted ml-auto" />
        <div className="h-3 w-12 animate-pulse rounded bg-surface-muted ml-auto" />
      </div>
    </div>
  )
}

export default function RecentInvoices({
  invoices,
  isLoading,
}: RecentInvoicesProps) {
  return (
    <div className="mt-6 rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold text-text-primary">
          Recent Invoices
        </h2>
        <Link
          href="/invoices"
          className="text-xs font-medium text-brand-green hover:text-brand-green-dark transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="px-6">
        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : invoices.length === 0 ? (
          <EmptyState />
        ) : (
          invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between py-4 border-b border-border last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {invoice.invoice_number}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {new Date(invoice.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    STATUS_STYLES[invoice.status] ?? ''
                  }`}
                >
                  {invoice.status}
                </span>

                <p className="text-sm font-semibold text-text-primary tabular-nums">
                  {formatCurrency(invoice.total_amount, invoice.currency)}
                </p>

                {invoice.pdf_url ? (
                  <a
                    href={invoice.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-brand-green hover:text-brand-green-dark transition-colors"
                  >
                    PDF
                  </a>
                ) : (
                  <span className="text-xs text-text-muted">—</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}