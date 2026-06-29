/**
 * lib/pdf/template.ts
 * Renders the full invoice as a self-contained HTML string for Puppeteer.
 *
 * Rules:
 * - Inter font embedded as base64 — no external CDN requests (offline-safe)
 * - font-feature-settings: "tnum" 1 on ALL monetary values (tabular numerals)
 * - Conditional rendering: omit any section with no data — never render null/N/A
 * - 9 sections in order: Header → Metadata → Client → Line Items → Totals →
 *   Payment Summary → Payment Details → Terms → Notes
 * - Footer: "Generated with SLIPA · slipa.app" — Inter 9pt, #9299A8, right-aligned
 *   This footer is MANDATORY and must NEVER be omitted or made conditional.
 */

import { Invoice, LineItem, Freelancer, Client } from '@/lib/db/types'

export interface InvoiceForPdf {
  invoice: Invoice
  lineItems: LineItem[]
  freelancer: FreelancerForPdf
  client: ClientForPdf | null
  decryptedAccountNumber: string | null
}

interface FreelancerForPdf {
  name: string
  email: string
  phone: string | null
  address: string | null
  bank_name: string | null
  account_name: string | null
}

interface ClientForPdf {
  name: string
  email: string | null
}

import { formatCurrency } from '@/lib/utils'

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// NOTE: In production, embed the actual Inter font as base64 here.
// The placeholder below loads from Google Fonts for development only.
// Before deploying, run: scripts/embed-inter-font.ts to replace with base64.
const INTER_FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');
`

export function renderInvoiceHtml(data: InvoiceForPdf): string {
  const { invoice, lineItems, freelancer, client, decryptedAccountNumber } = data
  const currency = invoice.currency

  // ── Section helpers ────────────────────────────────────────────────────

  const headerSection = `
    <div class="section header">
      <div class="wordmark">SLIPA</div>
      <div class="freelancer-info">
        <div class="name">${escapeHtml(freelancer.name)}</div>
        ${freelancer.email ? `<div>${escapeHtml(freelancer.email)}</div>` : ''}
        ${freelancer.phone ? `<div>${escapeHtml(freelancer.phone)}</div>` : ''}
        ${freelancer.address ? `<div>${escapeHtml(freelancer.address)}</div>` : ''}
      </div>
    </div>`

  const metadataSection = `
    <div class="section metadata">
      <div class="meta-row">
        <span class="label">Invoice Number</span>
        <span class="value">${escapeHtml(invoice.invoice_number)}</span>
      </div>
      <div class="meta-row">
        <span class="label">Date</span>
        <span class="value">${formatDate(invoice.created_at)}</span>
      </div>
    </div>`

  const clientSection = client ? `
    <div class="section client">
      <div class="section-title">Bill To</div>
      <div class="client-name">${escapeHtml(client.name)}</div>
      ${client.email ? `<div class="client-email">${escapeHtml(client.email)}</div>` : ''}
    </div>` : ''

  const lineItemsSection = `
    <div class="section line-items">
      <table>
        <thead>
          <tr>
            <th class="desc-col">Description</th>
            <th class="num-col">Qty</th>
            <th class="num-col">Unit Price</th>
            <th class="num-col">Total</th>
          </tr>
        </thead>
        <tbody>
          ${lineItems.map((item) => `
            <tr>
              <td class="desc-col">${escapeHtml(item.description)}</td>
              <td class="num-col numeric">${item.quantity}</td>
              <td class="num-col numeric">${formatCurrency(item.unit_price, currency)}</td>
              <td class="num-col numeric">${formatCurrency(item.line_total, currency)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`

  const totalsSection = `
    <div class="section totals">
      <div class="totals-grid">
        <div class="totals-row">
          <span>Subtotal</span>
          <span class="numeric">${formatCurrency(invoice.subtotal, currency)}</span>
        </div>
        ${invoice.discount_amount > 0 ? `
        <div class="totals-row">
          <span>Discount</span>
          <span class="numeric">− ${formatCurrency(invoice.discount_amount, currency)}</span>
        </div>` : ''}
        ${invoice.vat_amount > 0 ? `
        <div class="totals-row">
          <span>VAT (7.5%)</span>
          <span class="numeric">${formatCurrency(invoice.vat_amount, currency)}</span>
        </div>` : ''}
        <div class="totals-row total-row">
          <span>Total Amount Due</span>
          <span class="numeric">${formatCurrency(invoice.total_amount, currency)}</span>
        </div>
      </div>
    </div>`

  // Payment Summary: only render if amount has been paid
  const paymentSummarySection = invoice.amount_paid > 0 ? `
    <div class="section payment-summary">
      <div class="totals-grid">
        <div class="totals-row">
          <span>Amount Paid</span>
          <span class="numeric">${formatCurrency(invoice.amount_paid, currency)}</span>
        </div>
        <div class="totals-row balance-row">
          <span>Balance Due</span>
          <span class="numeric">${formatCurrency(invoice.balance_due, currency)}</span>
        </div>
      </div>
    </div>` : ''

  // Payment Details: only render if bank details are present
  const hasPaymentDetails =
    freelancer.bank_name || freelancer.account_name || decryptedAccountNumber
  const paymentDetailsSection = hasPaymentDetails ? `
    <div class="section payment-details">
      <div class="section-title">Payment Details</div>
      ${freelancer.bank_name ? `<div><span class="label">Bank</span> ${escapeHtml(freelancer.bank_name)}</div>` : ''}
      ${freelancer.account_name ? `<div><span class="label">Account Name</span> ${escapeHtml(freelancer.account_name)}</div>` : ''}
      ${decryptedAccountNumber ? `<div><span class="label">Account Number</span> <span class="numeric">${escapeHtml(decryptedAccountNumber)}</span></div>` : ''}
    </div>` : ''

  // Payment Terms: only render if set
  const termsSection = invoice.payment_terms ? `
    <div class="section terms">
      <div class="section-title">Payment Terms</div>
      <div>${escapeHtml(invoice.payment_terms)}</div>
    </div>` : ''

  // Notes: only render if set
  const notesSection = invoice.notes ? `
    <div class="section notes">
      <div class="section-title">Notes</div>
      <div>${escapeHtml(invoice.notes)}</div>
    </div>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${escapeHtml(invoice.invoice_number)}</title>
  <style>
    ${INTER_FONT_CSS}

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      font-size: 11pt;
      font-weight: 400;
      color: #0D0D1A;
      background: #FFFFFF;
      line-height: 1.5;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 40px;
      position: relative;
    }

    /* Tabular numerals on ALL monetary values */
    .numeric {
      font-feature-settings: "tnum" 1, "ss01" 1;
    }

    /* ── Sections ──────────────────────────────── */
    .section { margin-bottom: 28px; }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 24px;
      border-bottom: 2px solid #0D0D1A;
      margin-bottom: 28px;
    }
    .wordmark {
      font-size: 22pt;
      font-weight: 500;
      letter-spacing: -0.5px;
      color: #0D0D1A;
    }
    .freelancer-info { text-align: right; font-size: 9pt; color: #4B5264; line-height: 1.6; }
    .freelancer-info .name { font-weight: 500; font-size: 10pt; color: #0D0D1A; }

    /* Metadata */
    .metadata { background: #F7F8FA; padding: 16px; border-radius: 8px; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 9pt; }
    .meta-row:last-child { margin-bottom: 0; }
    .meta-row .label { color: #9299A8; text-transform: uppercase; letter-spacing: 0.04em; font-size: 8pt; }
    .meta-row .value { font-weight: 500; }

    /* Client */
    .section-title {
      font-size: 8pt;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #9299A8;
      margin-bottom: 8px;
    }
    .client-name { font-weight: 500; font-size: 11pt; }
    .client-email { font-size: 9pt; color: #4B5264; }

    /* Line items table */
    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    thead tr { border-bottom: 1px solid #E2E4E9; }
    thead th {
      padding: 8px 0;
      font-weight: 500;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #9299A8;
    }
    tbody tr { border-bottom: 1px solid #F0F1F4; }
    tbody td { padding: 10px 0; vertical-align: top; }
    .desc-col { text-align: left; }
    .num-col { text-align: right; }

    /* Totals */
    .totals-grid { margin-left: auto; width: 280px; }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 10pt;
      border-bottom: 1px solid #F0F1F4;
    }
    .total-row {
      font-weight: 500;
      font-size: 12pt;
      border-top: 2px solid #0D0D1A;
      border-bottom: none;
      padding-top: 10px;
      margin-top: 4px;
    }
    .balance-row {
      font-weight: 500;
      color: #00C896;
    }

    /* Payment details */
    .payment-details div { margin-bottom: 6px; font-size: 10pt; }
    .payment-details .label { color: #9299A8; font-size: 9pt; margin-right: 8px; }

    /* Terms & Notes */
    .terms, .notes { font-size: 9pt; color: #4B5264; line-height: 1.6; }

    /* ── Footer ────────────────────────────────── */
    /* MANDATORY on every invoice — never conditional, never omitted */
    .pdf-footer {
      position: fixed;
      bottom: 40px;
      right: 40px;
      font-family: 'Inter', sans-serif;
      font-size: 9pt;
      color: #9299A8;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="page">
    ${headerSection}
    ${metadataSection}
    ${clientSection}
    ${lineItemsSection}
    ${totalsSection}
    ${paymentSummarySection}
    ${paymentDetailsSection}
    ${termsSection}
    ${notesSection}
  </div>

  <!-- MANDATORY PDF FOOTER — Generated with SLIPA · slipa.app
       Inter 9pt · #9299A8 · right-aligned · never omitted -->
  <div class="pdf-footer">Generated with SLIPA · slipa.app</div>
</body>
</html>`
}

/** Escape HTML special characters to prevent XSS in the PDF template */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
