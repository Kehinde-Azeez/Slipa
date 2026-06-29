import { ReactNode } from 'react'
import DashboardLayout from '@/app/dashboard/layout'

export default function InvoicesLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
