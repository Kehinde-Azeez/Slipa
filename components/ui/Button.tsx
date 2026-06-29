/**
 * components/ui/Button.tsx
 * Primary UI primitive — used for all interactive actions across the app.
 * Min 44×44px touch target (mobile-first rule).
 * Loading state replaces text with spinner — never both simultaneously.
 * Disabled state: opacity-50, pointer-events-none.
 * Never hardcode hex values — use token Tailwind classes only.
 */

import { cn } from '@/lib/utils'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  children: React.ReactNode
  className?: string
  id?: string
  'aria-label'?: string
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-brand-green text-white hover:bg-brand-green-dark focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2',
  secondary:
    'bg-surface border border-border text-text-primary hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-alt focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2',
  danger:
    'bg-error text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-2 text-sm min-h-touch min-w-touch',
  md: 'px-4 py-3 text-base min-h-touch min-w-touch',
  lg: 'px-6 py-4 text-lg min-h-touch',
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
  className,
  id,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      className={cn(
        // Base
        'inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium',
        'transition-[background-color,opacity,border-color] duration-[150ms] ease-out',
        'focus:outline-none',
        // Variant
        variantClasses[variant],
        // Size
        sizeClasses[size],
        // Disabled / Loading
        isDisabled && 'opacity-50 pointer-events-none cursor-not-allowed',
        className
      )}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  )
}
