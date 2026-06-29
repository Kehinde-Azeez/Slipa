/**
 * app/auth/login/page.tsx
 * Login page — returning user entry point.
 * Headline: "Welcome back."
 * On success: redirect to /chat (session recovery check happens on the chat page).
 * No "Forgot password?" — deferred to v1.2.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import Logo from '@/components/branding/Logo'

export default function LoginPage() {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Display the server message — it is already generic for both failure cases
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      // Session recovery check happens on the chat page on mount
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
        <h1 className="text-xl font-medium text-text-primary text-center mb-8 leading-snug">
          Welcome back.
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Email address
            </label>
            <input
              id="login-email"
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
              htmlFor="login-password"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-4 py-3 rounded-md border border-border bg-surface text-text-primary placeholder:text-text-muted text-base focus:outline-none focus:border-border-strong transition-colors duration-micro min-h-touch"
            />
          </div>

          {/* Error */}
          {error && (
            <p
              id="login-error"
              role="alert"
              className="text-sm text-error bg-error-bg px-3 py-2 rounded-md"
            >
              {error}
            </p>
          )}

          <Button
            id="login-submit"
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full rounded-xl"
          >
            Log in
          </Button>
        </form>

        {/* Register link */}
        <p className="text-sm text-text-secondary text-center mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className="text-brand-green font-medium hover:text-brand-green-dark underline"
          >
            Get started
          </Link>
        </p>
      </div>
    </main>
  )
}
