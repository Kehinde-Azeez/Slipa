/**
 * lib/utils.ts
 * Shared utility helpers used across the app.
 * Keep this file small — only universal helpers belong here.
 */

/**
 * cn — merge Tailwind class names conditionally.
 * Lightweight alternative to clsx/cn for this project's needs.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Format a numeric amount as currency.
 * Mapped to the correct locale to ensure standard formatting (e.g. NGN -> ₦, USD -> $).
 */
export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  const locales: Record<string, string> = {
    NGN: 'en-NG',
    USD: 'en-US',
    GBP: 'en-GB',
    EUR: 'en-DE',
  }
  return new Intl.NumberFormat(locales[currency] ?? 'en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}
