import { AssistantIntent } from './system-prompt'

export function buildResponse(intent: AssistantIntent) {
  return {
    message: intentToMessage(intent),
    intent: intent.type,
    meta: {
      timestamp: Date.now(),
    },
  }
}

function intentToMessage(intent: AssistantIntent): string {
  switch (intent.type) {
    case 'collect_field':
      return intent.nextQuestion

    case 'clarify':
      return intent.question

    case 'request_confirmation':
      return intent.summary

    case 'confirmed':
      return 'Invoice confirmed successfully.'

    case 'correction':
      return intent.nextQuestion

    case 'refusal':
      return intent.reason

    case 'error':
      return intent.message
  }
}