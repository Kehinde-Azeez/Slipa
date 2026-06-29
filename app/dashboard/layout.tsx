
import { ReactNode } from 'react'

import DashboardHeader from '@/components/dashboard/DashboardHeader'
import Sidebar from '@/components/dashboard/Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-alt">
      <DashboardHeader />

      <div className="flex max-w-7xl mx-auto">
        <Sidebar />

        {/* pb-20 reserves space for the mobile bottom tab bar */}
        <main className="flex-1 px-4 py-8 pb-24 md:px-6 md:pb-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
