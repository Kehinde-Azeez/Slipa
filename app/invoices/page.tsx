'use client'

import { useEffect, useState, useCallback } from 'react'

import InvoiceTable from '@/components/dashboard/InvoiceTable'
import EmptyState from '@/components/dashboard/EmptyState'
import { Button } from '@/components/ui/Button'
import type { InvoiceSummary } from '@/lib/types/dashboard'
import { cn } from '@/lib/utils'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'error'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')

  const ITEMS_PER_PAGE = 10
  const [currentPage, setCurrentPage] = useState(1)

  const loadInvoices = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const res = await fetch('/api/dashboard/invoices')
      if (!res.ok) {
        setIsError(true)
        return
      }
      const data = await res.json()
      setInvoices(data)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  // Reset page whenever filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, sortBy])

  const filteredInvoices = invoices.filter((invoice) => {
    const term = search.toLowerCase()
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(term) ||
      (invoice.client_name ?? '').toLowerCase().includes(term)

    const matchesStatus = statusFilter === 'all' ? true : invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'highest':
        return b.total_amount - a.total_amount
      case 'lowest':
        return a.total_amount - b.total_amount
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const totalPages = Math.ceil(sortedInvoices.length / ITEMS_PER_PAGE)
  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">
          Invoice History
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          View every invoice you've generated.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <svg
            className="animate-spin h-6 w-6 text-brand-green"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <p className="text-error mb-4">Unable to load invoices.</p>
          <Button onClick={loadInvoices} variant="secondary">
            Try again
          </Button>
        </div>
      ) : (
        <>
          {/* Filters & Search */}
          <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
            <input
              type="text"
              aria-label="Search invoices"
              placeholder="Search invoice number or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'w-full lg:max-w-md px-4 py-2.5 rounded-lg border border-border bg-surface',
                'text-sm text-text-primary placeholder:text-text-muted',
                'focus:outline-none focus:border-border-strong transition-colors min-h-touch'
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'sent', 'draft', 'error'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      'px-4 py-2 rounded-full text-xs font-medium transition-colors duration-micro min-h-touch',
                      statusFilter === status
                        ? 'bg-brand-green text-white'
                        : 'bg-surface border border-border text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                    )}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className={cn(
                  'px-4 py-2 rounded-lg border border-border bg-surface text-sm text-text-secondary',
                  'focus:outline-none focus:border-border-strong transition-colors min-h-touch'
                )}
                aria-label="Sort invoices"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {invoices.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface py-12">
              <EmptyState />
            </div>
          ) : paginatedInvoices.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-12 text-center">
              <p className="text-text-secondary">
                No invoices match your filters.
              </p>
              <button
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                }}
                className="mt-4 text-sm font-medium text-brand-green hover:text-brand-green-dark"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <InvoiceTable invoices={paginatedInvoices} />

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-between">
                <Button
                  variant="secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                >
                  Previous
                </Button>

                <p className="text-sm text-text-secondary">
                  Page {currentPage} of {Math.max(totalPages, 1)}
                </p>

                <Button
                  variant="secondary"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
