/**
 * components/chat/ChatBubble.tsx
 * Renders a single conversation turn (user or assistant).
 * Design tokens used for all colours — no hardcoded hex values.
 *
 * Assistant: left-aligned · bg-surface-alt · rounded-r-2xl rounded-bl-2xl
 * User:      right-aligned · bg-brand-green · white text · rounded-l-2xl rounded-br-2xl
 */

'use client'

import { cn } from '@/lib/utils'
import { TypingIndicator } from './TypingIndicator'

interface ChatBubbleProps {
  role: 'assistant' | 'user'
  content: string
  isLoading?: boolean
}

export function ChatBubble({ role, content, isLoading = false }: ChatBubbleProps) {
  const isAssistant = role === 'assistant'

  return (
    <div
      className={cn(
        'flex w-full',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] px-4 py-3 text-base leading-relaxed',
          // Assistant bubble
          isAssistant && 'bg-surface-alt text-text-primary',
          isAssistant && 'rounded-r-2xl rounded-bl-2xl rounded-tl-sm',
          // User bubble
          !isAssistant && 'bg-brand-green text-white',
          !isAssistant && 'rounded-l-2xl rounded-br-2xl rounded-tr-sm'
        )}
      >
        {isLoading ? <TypingIndicator /> : content}
      </div>
    </div>
  )
}
