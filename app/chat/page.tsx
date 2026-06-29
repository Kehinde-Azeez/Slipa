/**
 * app/chat/page.tsx
 * Main conversational interface.
 * Checks for session recovery on mount.
 * All LLM calls go through POST /api/chat — never direct from this component.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { ConversationView, Message } from '@/components/chat/ConversationView'
import { ChatInput } from '@/components/chat/ChatInput'
import { NotificationBanner } from '@/components/ui/NotificationBanner'
import { InvoiceDownloadButton } from '@/components/invoice/InvoiceDownloadButton'
import Logo from '@/components/branding/Logo'
import Sidebar from '@/components/dashboard/Sidebar'
import { NOTIFICATIONS, NotificationPayload } from '@/lib/notifications/messages'

type NotificationType = NotificationPayload | null

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isResponding, setIsResponding] = useState(false)
  const [notification, setNotification] = useState<NotificationType>(null)
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null)

  // Check for session recovery on mount
  useEffect(() => {
    async function checkRecovery() {
      try {
        const res = await fetch('/api/chat/recovery')
        if (res.ok) {
          const { data } = await res.json()
          if (data?.hasRecoverableSession) {
            setNotification(NOTIFICATIONS.SESSION_RECOVERY())
          }
        }
      } catch {
        // Recovery check failure is non-blocking — continue to fresh session
      }
    }
    checkRecovery()
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (isResponding) return

    // Optimistically add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsResponding(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })

      if (res.status === 401) {
        // Session expired — redirect to login
        router.push('/auth/login')
        return
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: errData.error ?? 'Something went wrong. Please try again.',
        }
        setMessages((prev) => [...prev, errorMessage])
        return
      }

      const { data } = await res.json()

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.message,
      }
      setMessages((prev) => [...prev, assistantMessage])

      // If invoice generation was triggered previously, begin polling
      if (data.activeInvoiceId) {
        setActiveInvoiceId(data.activeInvoiceId)
      } else if (data.intent === 'confirmed') {
        // AI confirmed the summary -> Trigger generation on the backend
        try {
          const genRes = await fetch('/api/invoice/generate', { method: 'POST' })
          const genData = await genRes.json()
          if (genRes.ok && genData.data?.invoiceId) {
            setActiveInvoiceId(genData.data.invoiceId)
          } else {
            setMessages((prev) => [
              ...prev,
              { id: uuidv4(), role: 'assistant', content: genData.error || 'Failed to generate invoice.' }
            ])
          }
        } catch {
          setMessages((prev) => [
            ...prev,
            { id: uuidv4(), role: 'assistant', content: 'Network error generating invoice.' }
          ])
        }
      }
    } catch {
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "I couldn't send that. Check your connection and try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsResponding(false)
    }
  }, [isResponding, router])

  function handleNotificationAction(handler: string) {
    if (handler === 'clear_session') {
      fetch('/api/chat/session', { method: 'DELETE' }).catch(() => {})
      setNotification(null)
      setMessages([])
      setActiveInvoiceId(null)
    } else if (handler === 'resume_session') {
      setNotification(null)
      // Session is preserved — conversation continues from where it left off
    }
  }

  return (
    <div className="flex flex-col h-screen bg-surface-alt pb-16 md:pb-0">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <span className="text-lg font-medium text-text-primary tracking-tight">
          <Logo />
        </span>
        <a
          href="/profile"
          className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-micro min-h-touch min-w-touch flex items-center justify-center md:hidden"
          aria-label="Go to profile"
        >
          Profile
        </a>
      </header>

      {/* Notification — never shown mid-AI-turn */}
      {notification && !isResponding && (
        <NotificationBanner
          type={notification.type}
          title={notification.title}
          body={notification.body}
          action={'action' in notification && notification.action ? notification.action : undefined}
          secondaryAction={'secondaryAction' in notification ? notification.secondaryAction : undefined}
          onDismiss={() => setNotification(null)}
          onAction={(handler) => handleNotificationAction(handler)}
        />
      )}

      {/* Invoice download button — shown when PDF is generating */}
      {activeInvoiceId && (
        <div className="px-4 py-2 bg-surface border-b border-border">
          <InvoiceDownloadButton
            invoiceId={activeInvoiceId}
            onComplete={() => {
              // PDF is ready. Do not clear activeInvoiceId here, 
              // otherwise the download button unmounts instantly!
            }}
            onError={() => {
              setNotification(NOTIFICATIONS.PDF_FAILED())
            }}
          />
        </div>
      )}

      {/* Conversation */}
      <ConversationView messages={messages} isResponding={isResponding} />

      {/* Input */}
      <ChatInput onSend={sendMessage} isResponding={isResponding} />
      
      {/* Mobile Navigation (reused from Dashboard) */}
      <Sidebar hideDesktop />
    </div>
  )
}
