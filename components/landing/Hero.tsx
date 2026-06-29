'use client'

import FadeInUp from '@/components/ui/FadeInUp'
import Navbar from '@/components/landing/Navbar'
import Link from 'next/link'

export default function Hero() {
  return (
    <>
      {/* Sticky navbar lives outside the section so it overlays everything */}
      <Navbar />

      <section className="relative overflow-hidden bg-surface">

        {/* Background decoration — subtle grid + radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 select-none"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,200,150,0.12) 0%, transparent 70%),
              linear-gradient(to bottom right, rgba(0,200,150,0.03) 1px, transparent 1px),
              linear-gradient(to bottom left, rgba(0,200,150,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 48px 48px, 48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

          {/* ── Hero content — pt-36 clears the fixed navbar ── */}
          <div className="mx-auto max-w-3xl pb-32 pt-36 text-center">

            <FadeInUp>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-green/20 bg-brand-green-tint px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                <span className="text-sm font-medium text-brand-green">
                  AI-Powered · Zero forms · PDF in minutes
                </span>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.1}>
              <h1 className="text-5xl font-semibold leading-[1.15] tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
                Invoice clients
                <span className="relative mx-2 inline-block">
                  <span className="relative z-10 text-brand-green">faster</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 200 12"
                    className="absolute -bottom-1 left-0 w-full"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 8 Q 50 2, 100 8 Q 150 14, 198 8"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-brand-green"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                with conversation
              </h1>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <p className="mt-7 text-lg leading-relaxed text-text-secondary">
                Stop wasting time on complicated invoice forms. Tell SLIPA who
                you&apos;re billing and for what — your professional PDF is ready
                in under 2 minutes.
              </p>
            </FadeInUp>

            <FadeInUp delay={0.3}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/auth/register"
                  className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-brand-green px-8 py-3 text-base font-medium text-white shadow-md shadow-brand-green/20 transition-all duration-200 hover:bg-brand-green-dark hover:shadow-lg hover:-translate-y-0.5"
                >
                  Create your first invoice
                  <svg
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/auth/login"
                  className="inline-flex min-h-[48px] items-center rounded-full border border-border px-8 py-3 text-base font-medium text-text-secondary transition-all duration-200 hover:border-border-strong hover:text-text-primary"
                >
                  Already have an account
                </Link>
              </div>
            </FadeInUp>

            {/* ── Trust bar ── */}
            <FadeInUp delay={0.45}>
              <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted">
                {[
                  { icon: '🔒', label: 'Bank-grade encryption' },
                  { icon: '⚡', label: 'PDF in under 2 min' },
                  { icon: '🇳🇬', label: 'Built for Nigerian freelancers' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </FadeInUp>

          </div>
        </div>

        {/* Bottom edge fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-alt to-transparent"
        />
      </section>
    </>
  )
}