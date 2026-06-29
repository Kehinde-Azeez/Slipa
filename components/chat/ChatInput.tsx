/**
 * components/chat/ChatInput.tsx
 * Text input + send button for the chat interface.
 * Disabled while AI is responding (isResponding=true):
 *   - opacity-50, pointer-events-none
 *   - Shows "SLIPA is thinking..." as placeholder
 * Min 44px touch target on the send button.
 * Trims whitespace on submit. Rejects empty strings silently.
 */

'use client'

import { useState, KeyboardEvent, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  isResponding: boolean
}

export function ChatInput({ onSend, isResponding }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit() {
    const trimmed = value.trim()
    // Reject empty strings silently — no error shown
    if (!trimmed || isResponding) return
    onSend(trimmed)
    setValue('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Send on Enter (not Shift+Enter which inserts newline)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    // Auto-grow textarea up to ~6 lines
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div
      className={cn(
        'flex items-end gap-2 px-4 py-3',
        'bg-surface border-t border-border',
        isResponding && 'opacity-50 pointer-events-none'
      )}
      aria-disabled={isResponding}
    >
      <textarea
        ref={textareaRef}
        id="chat-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={
          isResponding ? 'SLIPA is thinking...' : 'Type your message...'
        }
        disabled={isResponding}
        rows={1}
        aria-label="Message input"
        className={cn(
          'flex-1 resize-none bg-surface-alt rounded-xl px-4 py-3',
          'text-base text-text-primary placeholder:text-text-muted',
          'border border-border focus:outline-none focus:border-border-strong',
          'min-h-[44px] max-h-[160px] leading-normal',
          'transition-border-color duration-micro',
          'font-sans'
        )}
      />
      <button
        id="chat-send-button"
        type="button"
        onClick={handleSubmit}
        disabled={isResponding || !value.trim()}
        aria-label="Send message"
        className={cn(
          'flex-shrink-0 flex items-center justify-center',
          'w-11 h-11 rounded-full',
          'bg-brand-green text-white',
          'transition-[background-color,opacity] duration-micro',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2',
          (isResponding || !value.trim()) && 'opacity-40 pointer-events-none'
        )}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  )
}
