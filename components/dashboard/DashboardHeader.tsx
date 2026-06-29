'use client'

import Link from 'next/link'
import Logo from '@/components/branding/Logo'

export default function DashboardHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <Logo />

        <Link
          href="/chat"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-green-dark min-h-touch focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
          aria-label="Create a new invoice"
        >
          New Invoice
        </Link>
      </div>
    </header>
  )
}