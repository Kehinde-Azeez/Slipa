/**
 * app/auth/register/page.tsx
 * Registration page — the first thing Tunde sees.
 * Fields: email and password ONLY. No name, no business details.
 * Trust message below the form is REQUIRED — not optional.
 * On success: redirect to /chat.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import Logo from '@/components/branding/Logo'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      // Success — go directly to chat
      router.push('/chat')
    } catch {
      setError('Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface-alt flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
<div className="mb-4 flex justify-center">
  <Logo />
</div>

<div className="mb-6 text-center">
  <Link
    href="/"
    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
  >
    ← Back to Home
  </Link>
</div>

        {/* Headline */}
        <h1 className="text-xl font-medium text-text-primary text-center mb-2 leading-snug">
          Get paid like a professional.
        </h1>
        <p className="text-base text-text-secondary text-center mb-8 leading-relaxed">
          Create invoices through conversation. No forms. No accounting.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="register-email"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Email address
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-md border border-border bg-surface text-text-primary placeholder:text-text-muted text-base focus:outline-none focus:border-border-strong transition-colors duration-micro min-h-touch"
            />
          </div>

         

          <div>
            <label
              htmlFor="register-password"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Password
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 rounded-md border border-border bg-surface text-text-primary placeholder:text-text-muted text-base focus:outline-none focus:border-border-strong transition-colors duration-micro min-h-touch"
            />
          </div>

          {/* Error */}
          {error && (
            <p
              id="register-error"
              role="alert"
              className="text-sm text-error bg-error-bg px-3 py-2 rounded-md"
            >
              {error}
            </p>
          )}

          <Button
            id="register-submit"
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full rounded-xl"
          >
            Create my account
          </Button>
        </form>

        {/* Trust message — REQUIRED, not optional (per onboarding skill) */}
        <p className="text-sm text-text-muted text-center mt-6 leading-relaxed">
          🔒 Your bank details are encrypted and never shared. Ever.
        </p>

        {/* Login link */}
        <p className="text-sm text-text-secondary text-center mt-4">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-brand-green font-medium hover:text-brand-green-dark underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
