import { SessionState } from './session'
import { isFieldAlreadyCollected } from './field-detector'

export function mockEngine(prompt: string, session?: SessionState) {
  const text = prompt.toLowerCase()

  const safeSession = session ?? {
    draftInvoice: {},
  } as SessionState

  const draft = safeSession.draftInvoice as Record<string, any>

  // 1. Extract the last user message
  let userMessage = text
  const lines = prompt.split('\n')
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].toLowerCase().startsWith('user: ')) {
      userMessage = lines[i].substring(6).trim()
      break
    }
  }

  // 2. Sequential state machine
  if (draft.clientName === undefined) {
    return {
      type: 'collect_field',
      field: 'clientName',
      value: userMessage,
      nextQuestion: 'What is the client email address?',
    }
  }

  if (draft.clientEmail === undefined) {
    return {
      type: 'collect_field',
      field: 'clientEmail',
      value: userMessage,
      nextQuestion: 'What service or product are you invoicing for?',
    }
  }

  if (draft.description === undefined) {
    return {
      type: 'collect_field',
      field: 'description',
      value: userMessage,
      nextQuestion: 'What quantity should appear on the invoice?',
    }
  }

  if (draft.quantity === undefined) {
    const qty = parseInt(userMessage.replace(/,/g, ''), 10)
    return {
      type: 'collect_field',
      field: 'quantity',
      value: isNaN(qty) ? 1 : qty,
      nextQuestion: 'What is the unit price?',
    }
  }

  if (draft.unitPrice === undefined) {
    const price = parseFloat(userMessage.replace(/,/g, ''))
    return {
      type: 'collect_field',
      field: 'unitPrice',
      value: isNaN(price) ? 0 : price,
      nextQuestion: 'Which currency? NGN, USD, GBP or EUR?',
    }
  }

  if (draft.currency === undefined) {
  const input = userMessage.trim().toLowerCase()

  let currency = ''

  switch (input) {
    case 'ngn':
    case 'naira':
    case '₦':
      currency = 'NGN'
      break

    case 'usd':
    case 'dollar':
    case 'dollars':
    case '$':
      currency = 'USD'
      break

    case 'gbp':
    case 'pound':
    case 'pounds':
    case '£':
      currency = 'GBP'
      break

    case 'eur':
    case 'euro':
    case 'euros':
    case '€':
      currency = 'EUR'
      break

    default:
      return {
        type: 'clarify',
        question:
          'Please enter one of these currencies: NGN, USD, GBP or EUR.',
      }
  }

  return {
    type: 'collect_field',
    field: 'currency',
    value: currency,
    nextQuestion: 'Has any payment already been received?',
  }
}

  if (safeSession.awaitingConfirmation) {
    if (userMessage.toLowerCase().includes('yes') || userMessage.toLowerCase().includes('confirm') || userMessage.toLowerCase().includes('good')) {
      return {
        type: 'confirmed',
        invoiceData: draft,
      }
    }
    
    return {
      type: 'clarify',
      question: 'Please type "yes" to confirm the invoice in this mock environment, or refresh to start over.',
    }
  }

  return {
    type: 'request_confirmation',
    summary: `Here's your invoice summary:\n\nClient: ${draft.clientName}\nEmail: ${draft.clientEmail}\nService: ${draft.description} (${draft.quantity} x ${draft.unitPrice})\nTotal: ${draft.currency} ${draft.quantity * draft.unitPrice}\n\nIs everything correct?`,
    invoiceData: draft,
  }
}