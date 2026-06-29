
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { label: 'Dashboard', href: '/dashboard', icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { label: 'New Invoice', href: '/chat', icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )},
  { label: 'Invoices', href: '/invoices', icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )},
  { label: 'Profile', href: '/profile', icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )},
]

export default function Sidebar({ hideDesktop = false }: { hideDesktop?: boolean }) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      {!hideDesktop && (
        <aside className="hidden md:flex md:w-60 md:flex-col md:shrink-0 border-r border-border bg-surface min-h-[calc(100vh-65px)]">
          <nav className="flex-1 p-4 space-y-1">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-green text-white'
                      : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                  }`}
                >
                  <span className="shrink-0">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </aside>
      )}

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 flex md:hidden border-t border-border bg-surface"
        aria-label="Mobile navigation"
      >
        {links.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                active ? 'text-brand-green' : 'text-text-muted hover:text-text-secondary'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="shrink-0">{link.icon}</span>
              <span className="leading-none">{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
