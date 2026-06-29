
'use client'

import { useEffect, useState } from 'react'

import DashboardStats from '@/components/dashboard/DashboardStats'
import RecentInvoices from '@/components/dashboard/RecentInvoices'

import type {
  DashboardStats as DashboardStatsType,
  InvoiceSummary,
} from '@/lib/types/dashboard'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsType>({
    totalInvoices: 0,
    revenue: 0,
    outstanding: 0,
    defaultCurrency: 'NGN',
  })
  const [recentInvoices, setRecentInvoices] = useState<InvoiceSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, recentRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/recent'),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (recentRes.ok) {
          const recentData = await recentRes.json()
          setRecentInvoices(recentData)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  return (
    <>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">
          Welcome back.
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Create invoices through conversation and keep track of your work.
        </p>
      </div>

      {/* Statistics */}
      <DashboardStats
        totalInvoices={stats.totalInvoices}
        revenue={stats.revenue}
        outstanding={stats.outstanding}
        defaultCurrency={stats.defaultCurrency}
        isLoading={isLoading}
      />

      {/* Recent invoices */}
      <RecentInvoices invoices={recentInvoices} isLoading={isLoading} />
    </>
  )
}
