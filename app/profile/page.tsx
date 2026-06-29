/**
 * app/profile/page.tsx
 * Freelancer profile management page.
 * SECURITY: account_number is NEVER displayed in plaintext.
 * SECURITY: account_number is NEVER stored in component state beyond this form.
 * Shows success/error feedback on save.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { SUPPORTED_CURRENCIES } from '@/lib/validation/index'

interface Profile {
  name: string
  email: string
  phone: string | null
  address: string | null
  default_currency: string
  bank_name: string | null
  account_name: string | null
  // account_number intentionally excluded — never in state
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  // account_number kept separate — sent on PUT but never pre-filled from GET
  // This is intentional: we never display the stored encrypted value
  const [accountNumber, setAccountNumber] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile')

        if (res.status === 401) {
          router.push('/auth/login')
          return
        }

        if (!res.ok) {
          setIsError(true)
          setMessage('Could not load your profile. Try refreshing.')
          return
        }

        const data = await res.json()
        setProfile(data.data)
      } catch {
        setIsError(true)
        setMessage('Could not load your profile. Try refreshing.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  async function saveProfile() {
    if (!profile) return

    setSaving(true)
    setMessage(null)
    setIsError(false)

    const payload: Record<string, unknown> = {
      name: profile.name || undefined,
      phone: profile.phone || undefined,
      address: profile.address || undefined,
      defaultCurrency: profile.default_currency,
      bankName: profile.bank_name || undefined,
      accountName: profile.account_name || undefined,
    }

    // Only send accountNumber if user explicitly entered a new one
    if (accountNumber.trim()) {
      payload.accountNumber = accountNumber.trim()
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setIsError(true)
        setMessage(data.error ?? 'Unable to save your profile.')
        return
      }

      // Clear accountNumber field after save — never leave it in state
      setAccountNumber('')
      setMessage('Profile updated successfully.')
    } catch {
      setIsError(true)
      setMessage('Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="py-16 text-center">
        <p className="text-text-muted">Loading your profile…</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="py-16 text-center">
        <p className="text-error">{message ?? 'Unable to load your profile.'}</p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 text-sm text-brand-green hover:text-brand-green-dark underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-text-primary">
        My Profile
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Keep your invoice information up to date.
      </p>

      <div className="mt-8 space-y-5">

        {/* Personal Details */}
        <section className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            Personal Details
          </h2>

          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-text-primary mb-1.5">
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              value={profile.name ?? ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-border-strong transition-colors min-h-touch"
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-text-primary mb-1.5">
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface-muted text-text-muted text-sm cursor-not-allowed min-h-touch"
            />
            <p className="mt-1 text-xs text-text-muted">Email cannot be changed.</p>
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-sm font-medium text-text-primary mb-1.5">
              Phone <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={profile.phone ?? ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+234 800 000 0000"
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-border-strong transition-colors min-h-touch"
            />
          </div>

          <div>
            <label htmlFor="profile-address" className="block text-sm font-medium text-text-primary mb-1.5">
              Address <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <textarea
              id="profile-address"
              value={profile.address ?? ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              rows={3}
              placeholder="Your business address"
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-border-strong transition-colors resize-none"
            />
          </div>

          <div>
            <label htmlFor="profile-currency" className="block text-sm font-medium text-text-primary mb-1.5">
              Default currency
            </label>
            <select
              id="profile-currency"
              value={profile.default_currency}
              onChange={(e) => setProfile({ ...profile, default_currency: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-text-primary text-sm focus:outline-none focus:border-border-strong transition-colors min-h-touch"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Bank Details */}
        <section className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              Bank Details
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              🔒 Your account number is encrypted at rest and never exposed.
            </p>
          </div>

          <div>
            <label htmlFor="profile-bank-name" className="block text-sm font-medium text-text-primary mb-1.5">
              Bank name <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <input
              id="profile-bank-name"
              type="text"
              value={profile.bank_name ?? ''}
              onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
              placeholder="e.g. GTBank"
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-border-strong transition-colors min-h-touch"
            />
          </div>

          <div>
            <label htmlFor="profile-account-name" className="block text-sm font-medium text-text-primary mb-1.5">
              Account name <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <input
              id="profile-account-name"
              type="text"
              value={profile.account_name ?? ''}
              onChange={(e) => setProfile({ ...profile, account_name: e.target.value })}
              placeholder="Name on your bank account"
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-border-strong transition-colors min-h-touch"
            />
          </div>

          <div>
            <label htmlFor="profile-account-number" className="block text-sm font-medium text-text-primary mb-1.5">
              Account number <span className="font-normal text-text-muted">(optional)</span>
            </label>
            {/* account_number is NEVER pre-filled — user must type a new one to update */}
            <input
              id="profile-account-number"
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter to update your account number"
              autoComplete="off"
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-border-strong transition-colors min-h-touch"
            />
            <p className="mt-1 text-xs text-text-muted">
              Leave blank to keep your existing account number.
            </p>
          </div>
        </section>

        {/* Feedback message */}
        {message && (
          <p
            role="alert"
            className={`text-sm px-4 py-3 rounded-lg ${
              isError
                ? 'text-error bg-error-bg'
                : 'text-success bg-success-bg'
            }`}
          >
            {message}
          </p>
        )}

        <Button
          id="profile-save"
          variant="primary"
          size="lg"
          isLoading={saving}
          onClick={saveProfile}
          className="w-full rounded-xl"
        >
          Save changes
        </Button>

        {/* Logout */}
        <div className="pt-2 pb-4">
          <button
            id="logout-button"
            type="button"
            onClick={handleLogout}
            className="w-full text-sm text-text-muted hover:text-error transition-colors min-h-touch flex items-center justify-center"
          >
            Log out
          </button>
        </div>

      </div>
    </div>
  )
}
