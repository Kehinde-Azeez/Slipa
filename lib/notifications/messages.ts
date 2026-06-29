/**
 * lib/notifications/messages.ts
 * All 6 notification message templates for SLIPA.
 * Exactly as defined in skills/notification-handler/SKILL.md.
 *
 * Copy rule: success notifications must feel like a small win for Tunde.
 * "Your invoice is ready" is not enough — write it as a moment worth celebrating.
 */

export const NOTIFICATIONS = {
  PDF_READY: (invoiceNumber: string, clientName: string, downloadUrl: string) => ({
    type: 'success' as const,
    title: '🎉 Your invoice is live!',
    body: `Invoice ${invoiceNumber} for ${clientName} is ready. Time to get paid.`,
    action: { label: 'Download PDF', url: downloadUrl },
  }),

  PDF_FAILED: () => ({
    type: 'error' as const,
    title: 'Invoice generation failed',
    body: 'Something went wrong while creating your PDF. Your invoice details are safe.',
    action: { label: 'Try again', handler: 'retry_pdf' },
  }),

  PROFILE_SAVED: () => ({
    type: 'success' as const,
    title: 'Profile saved ✓',
    body: "Your details have been saved. You're all set to create your first invoice.",
    action: null,
  }),

  PROFILE_UPDATED: (fields: string[]) => ({
    type: 'success' as const,
    title: 'Profile updated',
    body: `${fields.join(', ')} updated successfully. Changes apply to your next invoice.`,
    action: null,
  }),

  SESSION_RECOVERY: () => ({
    type: 'prompt' as const,
    title: 'Unfinished invoice found',
    body: "You have an invoice you didn't finish. Want to pick up where you left off?",
    action: { label: 'Continue', handler: 'resume_session' },
    secondaryAction: { label: 'Start fresh', handler: 'clear_session' },
  }),

  UNSUPPORTED_ACTION: (suggestion: string) => ({
    type: 'error' as const,
    title: 'I can only help with invoices',
    body: suggestion,
    action: null,
  }),
} as const

export type NotificationPayload =
  | ReturnType<typeof NOTIFICATIONS.PDF_READY>
  | ReturnType<typeof NOTIFICATIONS.PDF_FAILED>
  | ReturnType<typeof NOTIFICATIONS.PROFILE_SAVED>
  | ReturnType<typeof NOTIFICATIONS.PROFILE_UPDATED>
  | ReturnType<typeof NOTIFICATIONS.SESSION_RECOVERY>
  | ReturnType<typeof NOTIFICATIONS.UNSUPPORTED_ACTION>
