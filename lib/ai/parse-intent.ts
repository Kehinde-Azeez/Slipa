/**
 * lib/ai/parse-intent.ts
 * Parse LLM JSON response into AssistantIntent discriminated union.
 * On any parse failure, return a clarify intent with the raw response as the question.
 * This ensures the conversation never crashes — it degrades gracefully.
 */

import { AssistantIntent } from './system-prompt'

const VALID_INTENT_TYPES = new Set([
  'collect_field',
  'clarify',
  'request_confirmation',
  'confirmed',
  'correction',
  'refusal',
  'error',
])

export function parseIntent(rawResponse: string): AssistantIntent {
  try {
    // Strip markdown code fences if the model wraps the JSON
    const cleaned = rawResponse
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    // Validate shape — must have a recognised type field
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Response is not an object.')
    }
    if (!parsed.type || !VALID_INTENT_TYPES.has(parsed.type)) {
      throw new Error(`Unknown intent type: ${parsed.type}`)
    }

    return parsed as AssistantIntent
  } catch {
    // Any parse failure → treat the raw response as a clarifying question.
    // This prevents the conversation from crashing on unexpected model output.
    return {
      type: 'clarify',
      question: rawResponse,
    }
  }
}

/**
 * Extract the user-facing message from an intent.
 * Routes and components call this to get the string to show in the chat bubble.
 */
export function intentToMessage(intent: AssistantIntent): string {
  switch (intent.type) {
    case 'collect_field':
      return intent.nextQuestion
    case 'clarify':
      return intent.question
    case 'request_confirmation':
      return intent.summary
    case 'confirmed':
      return 'Great! Generating your invoice now...'
    case 'correction':
      return intent.nextQuestion
    case 'refusal':
      return `${intent.reason} ${intent.suggestion}`
    case 'error':
      return intent.message
  }
}
