import Link from 'next/link'
import Logo from '@/components/branding/Logo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        {/* Main grid: brand takes left half, links + trust split the right */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5 md:gap-8">

          {/* Brand column — spans 2 of 5 on desktop */}
          <div className="md:col-span-2">
            <Logo size={30} showWordmark />

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-text-secondary">
              Professional invoicing through conversation. Built for
              independent freelancers across Nigeria and beyond.
            </p>

            <p className="mt-5 text-xs font-medium text-text-muted">
              Supported currencies:&nbsp; NGN &middot; USD &middot; GBP &middot; EUR
            </p>
          </div>

          {/* Spacer column — only on desktop, pushes links to far right */}
          <div className="hidden md:block md:col-span-1" />

          {/* Links column */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-text-muted">
              Product
            </p>
            <ul className="space-y-4">
              {[
                { label: 'Features', href: '#features' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Get Started Free', href: '/auth/register' },
                { label: 'Log In', href: '/auth/login' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust column */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-text-muted">
              Trust &amp; Security
            </p>
            <ul className="space-y-4">
              {[
                '🔒 AES-256 bank encryption',
                '🚫 No bank numbers in logs',
                '☁️ Server-side calculations only',
                '🛡️ HttpOnly JWT authentication',
              ].map((item) => (
                <li key={item} className="text-sm leading-relaxed text-text-secondary">
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-text-muted">
            &copy; {currentYear} SLIPA. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Generated with SLIPA &middot; slipa.app
          </p>
        </div>

      </div>
    </footer>
  )
}