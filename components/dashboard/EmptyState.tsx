import Link from 'next/link'

export default function EmptyState() {
  return (
    <div className="text-center py-8">
      <p className="text-text-secondary mb-4">
        No invoices yet.
      </p>

      <Link
        href="/chat"
        className="inline-flex items-center justify-center rounded-full bg-brand-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-green-dark"
      >
        Create Your First Invoice
      </Link>
    </div>
  )
}