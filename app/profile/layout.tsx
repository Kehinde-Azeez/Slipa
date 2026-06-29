import { ReactNode } from 'react'
import DashboardLayout from '@/app/dashboard/layout'

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
