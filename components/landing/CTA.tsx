'use client'

import Link from 'next/link'
import SectionReveal from '@/components/ui/SectionReveal'

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-brand-ink py-28">

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 50% 100%, rgba(0,200,150,0.18) 0%, transparent 65%)',
        }}
      />

      {/* Subtle dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <SectionReveal>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-green/30 bg-brand-green/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
            <span className="text-sm font-medium text-brand-green">
              Free to start · No credit card required
            </span>
          </div>

          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Stop losing money to
            <br />
            <span className="text-brand-green">slow invoicing</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            Every day you delay sending an invoice is a day you delay getting
            paid. SLIPA gets your invoice out the door in under 2 minutes —
            so you can focus on the work that actually grows your income.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/register"
              className="group inline-flex min-h-[52px] items-center gap-2 rounded-full bg-brand-green px-10 py-3.5 text-base font-medium text-white shadow-lg shadow-brand-green/25 transition-all duration-200 hover:bg-brand-green-dark hover:shadow-xl hover:-translate-y-0.5"
            >
              Create your first invoice free
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
              className="inline-flex min-h-[52px] items-center rounded-full border border-white/20 px-10 py-3.5 text-base font-medium text-white/80 transition-all duration-200 hover:border-white/40 hover:text-white"
            >
              Log in
            </Link>
          </div>

        </SectionReveal>
      </div>
    </section>
  )
}