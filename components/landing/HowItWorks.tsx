'use client'

import SectionReveal from '@/components/ui/SectionReveal'

const steps = [
  {
    number: '01',
    title: 'Set up your profile once',
    description:
      'Add your name, email, and bank details. SLIPA encrypts your bank info securely and auto-fills it on every invoice you create.',
    detail: 'Takes less than 2 minutes',
  },
  {
    number: '02',
    title: 'Chat to create an invoice',
    description:
      'Tell SLIPA who you\'re billing and for what. "Invoice Tunde Design for the brand identity project, ₦350,000." That\'s it.',
    detail: 'Natural language — no forms',
  },
  {
    number: '03',
    title: 'Confirm the summary',
    description:
      'SLIPA shows you a clean summary of all the details it has collected. Review and confirm before anything is committed.',
    detail: 'You stay in control',
  },
  {
    number: '04',
    title: 'Download your PDF',
    description:
      'A pixel-perfect A4 invoice PDF is generated and ready to download in seconds. Send it straight to your client.',
    detail: 'Professional. Every time.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <SectionReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-green">
              The process
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
              From chat to paid in 4 steps
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-text-secondary">
              No accounting knowledge needed. SLIPA guides you through every
              step so you never get stuck.
            </p>
          </div>
        </SectionReveal>

        {/* Steps grid */}
        <div className="relative mt-20">

          {/* Connecting line — desktop only */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />

          <div className="grid gap-10 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, index) => (
              <SectionReveal key={step.number}>
                <div className="group relative flex flex-col">

                  {/* Number badge */}
                  <div className="relative z-10 mb-8 flex h-14 w-14 items-center justify-center rounded-full border-4 border-surface bg-brand-green shadow-md shadow-brand-green/20 transition-transform duration-300 group-hover:-translate-y-1">
                    <span className="text-sm font-bold text-white">
                      {step.number}
                    </span>
                  </div>

                  {/* Connector arrow — visible between steps on mobile */}
                  {index < steps.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute left-7 top-14 h-10 w-px bg-border lg:hidden"
                    />
                  )}

                  <h3 className="mb-3 text-xl font-semibold text-text-primary">
                    {step.title}
                  </h3>

                  <p className="mb-5 flex-1 text-sm leading-relaxed text-text-secondary">
                    {step.description}
                  </p>

                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-green">
                    <span className="h-1 w-1 rounded-full bg-brand-green" />
                    {step.detail}
                  </div>

                </div>
              </SectionReveal>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}