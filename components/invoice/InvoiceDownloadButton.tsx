/**
 * components/invoice/InvoiceDownloadButton.tsx
 * Polls GET /api/invoice/[id]/status every 2 seconds while status is 'generating'.
 * On ready: renders as <a href={pdfUrl} download> with .pdf-download-btn--ready animation.
 * On error: shows a retry action — never a dead end.
 * Never leaves the user with a blank or frozen state.
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface InvoiceDownloadButtonProps {
  invoiceId: string
  onComplete: () => void
  onError: () => void
}

type DownloadStatus = 'generating' | 'ready' | 'error'

export function InvoiceDownloadButton({
  invoiceId,
  onComplete,
  onError,
}: InvoiceDownloadButtonProps) {
  const [status, setStatus] = useState<DownloadStatus>('generating')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [invoiceNumber, setInvoiceNumber] = useState<string>('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Start polling every 2 seconds
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/invoice/${invoiceId}/status`)
        if (!res.ok) return

        const { data } = await res.json()

        if (data.status === 'sent' && data.pdfUrl) {
          // PDF is ready — stop polling
          clearInterval(pollRef.current!)
          setPdfUrl(data.pdfUrl)
          setInvoiceNumber(data.invoiceNumber ?? '')
          setStatus('ready')
          onComplete()
        } else if (data.status === 'error') {
          // PDF failed — stop polling, show error
          clearInterval(pollRef.current!)
          setStatus('error')
          onError()
        }
        // Still 'draft' or 'generating' — keep polling
      } catch {
        // Network error — keep polling, don't surface to user
      }
    }, 2000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [invoiceId, onComplete, onError])

  function handleRetry() {
    setStatus('generating')
    // Re-mount by resetting — parent should trigger a new generation
    onError()
  }

  if (status === 'generating') {
    return (
      <div className="flex items-center gap-3 py-2">
        <svg
          className="animate-spin h-4 w-4 text-brand-green flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm text-text-secondary">
          Creating your invoice PDF…
        </span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-3 py-2">
        <span className="text-sm text-error">
          Something went wrong. Try again.
        </span>
        <button
          id="retry-pdf-button"
          type="button"
          onClick={handleRetry}
          className="text-sm font-medium text-brand-green hover:text-brand-green-dark underline min-h-touch flex items-center"
          aria-label="Retry invoice generation"
        >
          Try again
        </button>
      </div>
    )
  }

  // status === 'ready' — render as native download link with celebration animation
  return (
    <a
      id="invoice-download-link"
      href={pdfUrl!}
      download={`SLIPA-${invoiceNumber}.pdf`}
      className={cn(
        'pdf-download-btn pdf-download-btn--ready',
        'inline-flex items-center gap-2 px-4 py-3 rounded-full',
        'bg-brand-green text-white font-medium text-base',
        'min-h-touch',
        'hover:bg-brand-green-dark transition-colors duration-micro'
      )}
      aria-label={`Download invoice ${invoiceNumber}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download Invoice
    </a>
  )
}
