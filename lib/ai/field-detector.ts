import { SessionState } from './session'

export function isFieldAlreadyCollected(
  session: SessionState,
  field: string
): boolean {
  const draft = session.draftInvoice as Record<string, any>

  const value = draft?.[field]

  return value !== undefined && value !== null && value !== ''
}