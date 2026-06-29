/**
 * components/chat/ConversationView.tsx
 * Scrollable list of ChatBubble components.
 * Auto-scrolls to the latest message when new content arrives.
 * Preserves scroll position if user scrolls up to review history.
 */

'use client'

import { useEffect, useRef } from 'react'
import { ChatBubble } from './ChatBubble'

export interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
}

interface ConversationViewProps {
  messages: Message[]
  isResponding: boolean
}

export function ConversationView({ messages, isResponding }: ConversationViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const userScrolled = useRef(false)

  // Track if user has scrolled up manually
  function handleScroll() {
    const el = containerRef.current
    if (!el) return
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    userScrolled.current = !isAtBottom
  }

  // Auto-scroll to bottom when new messages arrive (unless user scrolled up)
  useEffect(() => {
    if (!userScrolled.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isResponding])

  // Reset scroll tracking when AI responds (new assistant message = scroll to bottom)
  useEffect(() => {
    if (isResponding) {
      userScrolled.current = false
    }
  }, [isResponding])

  const isEmpty = messages.length === 0 && !isResponding

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      role="log"
      aria-label="Conversation"
      aria-live="polite"
    >
      {isEmpty && (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="text-4xl mb-4" aria-hidden="true">💬</div>
          <p className="text-text-secondary text-base font-medium">
            Start by telling me about your latest project.
          </p>
          <p className="text-text-muted text-sm mt-2">
            I'll help you create a professional invoice in minutes.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          role={message.role}
          content={message.content}
        />
      ))}

      {/* Typing indicator — shown while AI is responding */}
      {isResponding && (
        <ChatBubble role="assistant" content="" isLoading />
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  )
}
