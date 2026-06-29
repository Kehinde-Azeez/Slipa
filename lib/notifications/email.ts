/**
 * lib/notifications/email.ts
 * Optional transactional email delivery for PDF ready notifications.
 * v1.0: stub only — integrate Resend or Postmark before enabling.
 *
 * Rules:
 * - NEVER include bank account numbers in email body
 * - NEVER include invoice amounts in email body
 * - Only include: invoice number, client name, time-limited download link (24h)
 * - Send plain text only — no HTML email in v1.0
 */

interface PdfReadyEmailParams {
  to: string
  invoiceNumber: string
  clientName: string
  downloadUrl: string   // signed URL, 24h expiry
}

/**
 * sendPdfReadyEmail — send a transactional email when a PDF is ready.
 * Replace the stub body with a real email provider call before enabling.
 *
 * Recommended providers: Resend (resend.com) or Postmark.
 * Add EMAIL_API_KEY and EMAIL_FROM to .env.local when integrating.
 */
export async function sendPdfReadyEmail(params: PdfReadyEmailParams): Promise<void> {
  const emailEnabled = Boolean(process.env.EMAIL_API_KEY)
  if (!emailEnabled) {
    // Email not configured — skip silently. In-app notification handles it.
    return
  }

  // TODO: Replace with Resend/Postmark SDK call
  // Example with Resend:
  //
  // const resend = new Resend(process.env.EMAIL_API_KEY)
  // await resend.emails.send({
  //   from: process.env.EMAIL_FROM ?? 'invoices@slipa.app',
  //   to: params.to,
  //   subject: `Your SLIPA invoice is ready — ${params.invoiceNumber}`,
  //   text: [
  //     `Hi,`,
  //     ``,
  //     `Your invoice ${params.invoiceNumber} for ${params.clientName} is ready.`,
  //     ``,
  //     `Download it here (link expires in 24 hours):`,
  //     params.downloadUrl,
  //     ``,
  //     `— SLIPA`,
  //   ].join('\n'),
  // })

  console.info(
    `[email] PDF ready email would be sent to ${params.to} for invoice ${params.invoiceNumber}`
  )
}
