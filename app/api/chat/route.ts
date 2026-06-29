/**
 * POST /api/chat
 * Core AI conversation turn (Gemini-only version)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { SYSTEM_PROMPT, SYSTEM_PROMPT_VERSION } from '@/lib/ai/system-prompt'
import { parseIntent, intentToMessage } from '@/lib/ai/parse-intent'
import { generateAIResponse } from '@/lib/ai/provider'
import {
  getSession,
  upsertSession,
  buildContextBlock,
  getLast10Turns,
} from '@/lib/ai/session'
import { z } from 'zod'

// Input validation
const chatSchema = z.object({
  message: z.string().min(1).max(2000),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Auth
    const freelancer = await requireAuth(req)

    // 2. Validate input
    const body = await req.json()
    const input = chatSchema.safeParse(body)

    if (!input.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    }

    const userMessage = input.data.message
      .replace(/<[^>]*>/g, '')
      .trim()

    // 3. Session
    const existingSession = getSession(freelancer.id)

    const session = upsertSession(freelancer.id, {
      freelancerId: freelancer.id,
      profileComplete:
        existingSession?.profileComplete ??
        Boolean(freelancer.name && freelancer.name.trim() !== ''),
      conversationHistory: existingSession?.conversationHistory ?? [],
      draftInvoice: existingSession?.draftInvoice ?? {},
      awaitingConfirmation:
        existingSession?.awaitingConfirmation ?? false,
    })

    // 4. Build AI context
    const contextBlock = buildContextBlock(session)
    const last10 = getLast10Turns(session)

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: contextBlock },
      ...last10.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ]

    // 5. GEMINI CALL (ONLY AI PROVIDER)
    const prompt = messages
      .map((m) => {
        const content =
          typeof m.content === 'string'
            ? m.content
            : JSON.stringify(m.content)

        return `${m.role}: ${content}`
      })
      .join('\n\n')

    const rawResponse = await generateAIResponse(prompt, freelancer.id)

    // Log (safe)
    console.info(
      `[chat] prompt_version=${SYSTEM_PROMPT_VERSION} freelancer_id_hash=redacted`
    )

    // 6. Parse intent
    const intent = parseIntent(rawResponse)
    const assistantMessage = intentToMessage(intent)

    // 7. Update session
    const updatedHistory = [
      ...session.conversationHistory,
      { role: 'user' as const, content: userMessage },
      { role: 'assistant' as const, content: rawResponse },
    ]

    const updatedDraft = { ...session.draftInvoice }

    if (
      intent.type === 'collect_field' &&
      intent.field &&
      intent.value !== undefined
    ) {
      const fieldMap: Record<string, string> = {
        clientName: 'clientName',
        clientEmail: 'clientEmail',
        currency: 'currency',
        amountPaid: 'amountPaid',
        paymentTerms: 'paymentTerms',
        vatOptIn: 'vatOptIn',
        discountAmount: 'discountAmount',
        notes: 'notes',
      }

      const draftKey = fieldMap[intent.field] ?? intent.field

      ;(updatedDraft as Record<string, unknown>)[draftKey] =
        intent.value
    }

    const awaitingConfirmation =
      intent.type === 'request_confirmation'
        ? true
        : intent.type === 'correction'
        ? false
        : session.awaitingConfirmation

    upsertSession(freelancer.id, {
      conversationHistory: updatedHistory,
      draftInvoice: updatedDraft,
      awaitingConfirmation,
    })

    return NextResponse.json({
      data: {
        message: assistantMessage,
        intent: intent.type,

        ...(intent.type === 'request_confirmation' && {
          invoiceData: intent.invoiceData,
        }),

        ...(session.activeInvoiceId && {
          activeInvoiceId: session.activeInvoiceId,
        }),
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}