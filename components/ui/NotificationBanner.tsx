/**
 * components/ui/NotificationBanner.tsx
 * In-app notification banner for SLIPA events.
 *
 * Rules:
 * - success type: auto-dismiss after 5 seconds
 * - error type: persist until user dismisses
 * - prompt type: persist with two action buttons
 * - Never render while AI turn is in progress (isResponding — enforced by parent)
 * - Never overlaps the chat view — rendered above it in the layout
 * - Always includes a dismiss button (min 44×44px)
 */

'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface NotificationAction {
  label: string
  url?: string
  handler?: string
}

interface NotificationBannerProps {
  type: 'success' | 'error' | 'prompt'
  title: string
  body: string
  action?: NotificationAction | null
  secondaryAction?: { label: string; handler: string }
  onDismiss: () => void
  onAction?: (handler: string) => void
}

const typeClasses: Record<string, string> = {
  success: 'bg-brand-green-tint border-brand-green text-text-primary',
  error:   'bg-error-bg border-error text-text-primary',
  prompt:  'bg-surface border-border-strong text-text-primary',
}

const iconMap: Record<string, string> = {
  success: '✓',
  error:   '!',
  prompt:  '?',
}

const iconClasses: Record<string, string> = {
  success: 'bg-brand-green text-white',
  error:   'bg-error text-white',
  prompt:  'bg-text-muted text-white',
}

export function NotificationBanner({
  type,
  title,
  body,
  action,
  secondaryAction,
  onDismiss,
  onAction,
}: NotificationBannerProps) {
  const [visible, setVisible] = useState(true)

  // Auto-dismiss success notifications after 5 seconds
  useEffect(() => {
    if (type !== 'success') return
    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss()
    }, 5000)
    return () => clearTimeout(timer)
  }, [type, onDismiss])

  if (!visible) return null

  function handleAction(handler?: string, url?: string) {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else if (handler && onAction) {
      onAction(handler)
    }
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-start gap-3 px-4 py-3',
        'border-l-4',
        typeClasses[type]
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
          'text-xs font-bold',
          iconClasses[type]
        )}
        aria-hidden="true"
      >
        {iconMap[type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="text-sm text-text-secondary mt-0.5">{body}</p>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex items-center gap-3 mt-2">
            {action && (
              <button
                id={`notification-action-${action.handler ?? 'primary'}`}
                type="button"
                onClick={() => handleAction(action.handler, action.url)}
                className="text-sm font-medium text-brand-green hover:text-brand-green-dark underline min-h-touch flex items-center"
              >
                {action.label}
              </button>
            )}
            {secondaryAction && (
              <button
                id={`notification-action-${secondaryAction.handler}`}
                type="button"
                onClick={() => onAction?.(secondaryAction.handler)}
                className="text-sm text-text-muted hover:text-text-secondary underline min-h-touch flex items-center"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dismiss — min 44×44px touch target */}
      <button
        id="notification-dismiss"
        type="button"
        onClick={() => {
          setVisible(false)
          onDismiss()
        }}
        aria-label="Dismiss notification"
        className="flex-shrink-0 flex items-center justify-center min-h-touch min-w-touch text-text-muted hover:text-text-primary transition-colors duration-micro"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
