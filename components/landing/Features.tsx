'use client'

import SectionReveal from '@/components/ui/SectionReveal'

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Conversational Invoicing',
    description:
      'No forms. No jargon. Just describe your project in plain language and SLIPA builds the invoice — the same way you&apos;d tell a friend.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Professional PDF Output',
    description:
      'Every invoice is rendered as a pixel-perfect A4 PDF — complete with your bank details, line items, VAT, and a unique invoice number.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Bank-grade Security',
    description:
      'Your bank account details are encrypted with AES-256 and never exposed in logs or API responses — only used when your PDF is generated.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Smart Defaults',
    description:
      'SLIPA remembers your freelancer profile and auto-fills your details on every invoice, so you never repeat yourself.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Mobile First',
    description:
      'Designed for your phone. Create and download a complete invoice in under 2 minutes from any device, anywhere.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: 'Atomic Invoice Numbers',
    description:
      'Sequential invoice numbers are reserved atomically — no gaps, no duplicates, no matter how many invoices you create.',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-surface-alt py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <SectionReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-green">
              Everything you need
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
              Built for real freelancers
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-text-secondary">
              Not an accounting tool with a chat wrapper. SLIPA is built
              ground-up around how independent professionals actually work.
            </p>
          </div>
        </SectionReveal>

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <SectionReveal key={feature.title}>
              <div className="group flex flex-col rounded-2xl border border-border bg-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/30 hover:shadow-xl hover:shadow-brand-green/5">

                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-tint text-brand-green transition-colors duration-300 group-hover:bg-brand-green group-hover:text-white">
                  {feature.icon}
                </div>

                <h3 className="mb-3 text-lg font-semibold text-text-primary">
                  {feature.title}
                </h3>

                <p
                  className="text-sm leading-relaxed text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: feature.description }}
                />

              </div>
            </SectionReveal>
          ))}
        </div>

      </div>
    </section>
  )
}