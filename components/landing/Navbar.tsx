'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/branding/Logo'
import { AnimatePresence, motion } from 'framer-motion'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Add shadow/border to navbar when user scrolls down
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <>
      {/* ── Sticky top bar ── */}
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled
            ? 'border-b border-border bg-[color-mix(in_srgb,var(--color-surface)_90%,transparent)] shadow-sm backdrop-blur-md'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

          {/* Logo */}
          <Logo size={32} showWordmark onClick={close} />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/login"
              className="rounded-full border border-border px-5 py-2 text-sm font-medium text-text-primary transition-all duration-200 hover:border-border-strong hover:bg-surface-alt"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-brand-green px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-green-dark hover:-translate-y-px hover:shadow-md"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile: hamburger button */}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-primary transition-colors hover:bg-surface-alt md:hidden"
          >
            {/* Animated hamburger → X icon */}
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <motion.line
                x1="3" y1="6" x2="21" y2="6"
                animate={menuOpen ? { x1: 5, y1: 5, x2: 19, y2: 19 } : { x1: 3, y1: 6, x2: 21, y2: 6 }}
                transition={{ duration: 0.2 }}
              />
              <motion.line
                x1="3" y1="12" x2="21" y2="12"
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.15 }}
              />
              <motion.line
                x1="3" y1="18" x2="21" y2="18"
                animate={menuOpen ? { x1: 5, y1: 19, x2: 19, y2: 5 } : { x1: 3, y1: 18, x2: 21, y2: 18 }}
                transition={{ duration: 0.2 }}
              />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Mobile menu drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-brand-ink/40 backdrop-blur-sm md:hidden"
              aria-hidden="true"
              onClick={close}
            />

            {/* Slide-in drawer */}
            <motion.div
              key="drawer"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col bg-surface shadow-2xl md:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <Logo size={28} showWordmark onClick={close} />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={close}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-6 py-8" aria-label="Mobile navigation">
                <ul className="space-y-1">
                  {navLinks.map(({ label, href }, i) => (
                    <motion.li
                      key={label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.06 }}
                    >
                      <a
                        href={href}
                        onClick={close}
                        className="flex items-center gap-3 rounded-xl px-4 py-4 text-base font-medium text-text-primary transition-colors hover:bg-surface-alt"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                        {label}
                      </a>
                    </motion.li>
                  ))}
                </ul>

                {/* Divider */}
                <div className="my-6 h-px bg-border" />

                {/* Auth CTAs */}
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                  >
                    <Link
                      href="/auth/register"
                      onClick={close}
                      className="flex w-full items-center justify-center rounded-full bg-brand-green px-6 py-3.5 text-base font-medium text-white shadow-md shadow-brand-green/20 transition-all hover:bg-brand-green-dark"
                    >
                      Get Started Free
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                  >
                    <Link
                      href="/auth/login"
                      onClick={close}
                      className="flex w-full items-center justify-center rounded-full border border-border px-6 py-3.5 text-base font-medium text-text-primary transition-all hover:bg-surface-alt"
                    >
                      Log In
                    </Link>
                  </motion.div>
                </div>
              </nav>

              {/* Drawer footer */}
              <div className="border-t border-border px-6 py-5">
                <p className="text-center text-xs text-text-muted">
                  🔒 Bank-grade security &middot; PDF in under 2 min
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
