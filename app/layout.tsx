import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'SLIPA',
  description: 'Professional invoices through conversation.',
  icons: {
    icon: '/branding/slipa-favicon.svg',
  },
  openGraph: {
    title: 'SLIPA',
    description: 'Professional invoices through conversation.',
    images: ['/branding/slipa-logo.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-surface-alt text-text-primary antialiased`}>
        {children}
      </body>
    </html>
  )
}
