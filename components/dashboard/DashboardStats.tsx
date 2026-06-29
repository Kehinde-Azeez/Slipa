import { formatCurrency } from '@/lib/utils'

interface DashboardStatsProps {
  totalInvoices: number
  revenue: number
  outstanding: number
  defaultCurrency?: string
  isLoading?: boolean
}

function StatCard({
  label,
  value,
  isLoading,
}: {
  label: string
  value: string
  isLoading?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
        {label}
      </p>
      {isLoading ? (
        <div className="mt-3 h-8 w-24 animate-pulse rounded-md bg-surface-muted" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
          {value}
        </p>
      )}
    </div>
  )
}

export default function DashboardStats({
  totalInvoices,
  revenue,
  outstanding,
  defaultCurrency = 'NGN',
  isLoading,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Total Invoices"
        value={String(totalInvoices)}
        isLoading={isLoading}
      />
      <StatCard
        label="Revenue Generated"
        value={formatCurrency(revenue, defaultCurrency)}
        isLoading={isLoading}
      />
      <StatCard
        label="Outstanding"
        value={formatCurrency(outstanding, defaultCurrency)}
        isLoading={isLoading}
      />
    </div>
  )
}