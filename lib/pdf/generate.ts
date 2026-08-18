/**
 * lib/pdf/generate.ts
 *
 * Production PDF generation pipeline:
 *
 * Invoice data
 *      ↓
 * Render HTML
 *      ↓
 * PDFShift
 *      ↓
 * PDF Buffer
 *      ↓
 * Supabase Storage
 *      ↓
 * Public PDF URL
 *      ↓
 * invoices.pdf_url
 *
 * SECURITY:
 * decryptBankDetail() is called ONLY in this file.
 * Never call it from routes, components, or other modules.
 *
 * STORAGE:
 * PDFs are stored in Supabase Storage.
 * We do NOT write PDFs to the Vercel filesystem.
 */

import { query } from '@/lib/db'
import { decryptBankDetail } from '@/lib/encryption'
import { renderInvoiceHtml, InvoiceForPdf } from './template'
import { generatePdfBuffer } from './pdfshift'
import { Invoice, LineItem } from '@/lib/db/types'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || 'slipa-pdfs'

interface InvoiceRow extends Invoice {
  client_name: string | null
  client_email: string | null

  freelancer_name: string
  freelancer_email: string
  freelancer_phone: string | null
  freelancer_address: string | null

  freelancer_bank_name: string | null
  freelancer_account_name: string | null
  freelancer_account_number: string | null
}

/**
 * Generate the invoice PDF and store it in Supabase Storage.
 *
 * On success:
 * - PDF is uploaded to Supabase Storage
 * - invoices.pdf_url is updated
 * - invoice status becomes 'sent'
 *
 * On failure:
 * - the error is allowed to propagate to the calling route
 * - the calling route is responsible for marking the invoice as error
 */
export async function generateAndStorePdf(
  invoiceId: string,
  freelancerId: string
): Promise<void> {
  // ------------------------------------------------------------
  // 1. Validate Supabase configuration
  // ------------------------------------------------------------

  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL is missing.')
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing.')
  }

  if (!SUPABASE_STORAGE_BUCKET) {
    throw new Error('SUPABASE_STORAGE_BUCKET is missing.')
  }

  // ------------------------------------------------------------
  // 2. Fetch invoice + freelancer + client information
  // ------------------------------------------------------------

  const result = await query<InvoiceRow>(
    `SELECT
       inv.*,

       c.name  AS client_name,
       c.email AS client_email,

       f.name    AS freelancer_name,
       f.email   AS freelancer_email,
       f.phone   AS freelancer_phone,
       f.address AS freelancer_address,

       f.bank_name     AS freelancer_bank_name,
       f.account_name  AS freelancer_account_name,
       f.account_number AS freelancer_account_number

     FROM invoices inv

     LEFT JOIN clients c
       ON c.id = inv.client_id

     LEFT JOIN freelancers f
       ON f.id = inv.freelancer_id

     WHERE inv.id = $1
       AND inv.freelancer_id = $2`,
    [invoiceId, freelancerId]
  )

  const row = result.rows[0]

  if (!row) {
    throw new Error(`Invoice ${invoiceId} not found.`)
  }

  // ------------------------------------------------------------
  // 3. Fetch invoice line items
  // ------------------------------------------------------------

  const lineItemsResult = await query<LineItem>(
    `SELECT *
     FROM line_items
     WHERE invoice_id = $1
     ORDER BY id`,
    [invoiceId]
  )

  // ------------------------------------------------------------
  // 4. Decrypt bank account number ONLY here
  // ------------------------------------------------------------

  let decryptedAccountNumber: string | null = null

  if (row.freelancer_account_number) {
    try {
      decryptedAccountNumber = decryptBankDetail(
        row.freelancer_account_number
      )
    } catch (error) {
      console.error(
        '[PDF] Bank account decryption failed:',
        error
      )

      // Do not fail the entire PDF because of bank-detail
      // decryption. Generate the invoice without the account number.
      decryptedAccountNumber = null
    }
  }

  // ------------------------------------------------------------
  // 5. Build PDF data
  // ------------------------------------------------------------

  const invoiceData: InvoiceForPdf = {
    invoice: row,

    lineItems: lineItemsResult.rows,

    freelancer: {
      name: row.freelancer_name,
      email: row.freelancer_email,
      phone: row.freelancer_phone,
      address: row.freelancer_address,
      bank_name: row.freelancer_bank_name,
      account_name: row.freelancer_account_name,
    },

    client: row.client_name
      ? {
          name: row.client_name,
          email: row.client_email,
        }
      : null,

    decryptedAccountNumber,
  }

  // ------------------------------------------------------------
  // 6. Render invoice HTML
  // ------------------------------------------------------------

  const html = renderInvoiceHtml(invoiceData)

  // ------------------------------------------------------------
  // 7. Convert HTML → PDF using PDFShift
  // ------------------------------------------------------------

  console.info(
    `[PDF] Generating PDF for invoice ${row.invoice_number}`
  )

  const pdfBuffer = await generatePdfBuffer(html)

  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error('PDFShift returned an empty PDF.')
  }

  console.info(
    `[PDF] PDF generated successfully. Size: ${pdfBuffer.length} bytes`
  )

  // ------------------------------------------------------------
  // 8. Upload PDF to Supabase Storage
  // ------------------------------------------------------------

  const pdfUrl = await storePdfInSupabase(
    pdfBuffer,
    row.invoice_number,
    row.client_name ?? 'client'
  )

  // ------------------------------------------------------------
  // 9. Save PDF URL to invoice
  // ------------------------------------------------------------

  await query(
    `UPDATE invoices
     SET pdf_url = $1,
         status = 'sent'
     WHERE id = $2`,
    [pdfUrl, invoiceId]
  )

  console.info(
    `[PDF] Invoice ${row.invoice_number} stored successfully.`
  )
}

/**
 * Upload the generated PDF to Supabase Storage.
 *
 * Files are stored using:
 *
 * invoices/{invoiceNumber}/{safeClientName}.pdf
 *
 * Example:
 *
 * invoices/SLP-000123/Acme-Ltd.pdf
 */
async function storePdfInSupabase(
  buffer: Buffer,
  invoiceNumber: string,
  clientName: string
): Promise<string> {
  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL is missing.')
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing.')
  }

  if (!SUPABASE_STORAGE_BUCKET) {
    throw new Error('SUPABASE_STORAGE_BUCKET is missing.')
  }

  // ------------------------------------------------------------
  // 1. Create a safe filename
  // ------------------------------------------------------------

  const safeInvoiceNumber = invoiceNumber
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .slice(0, 80)

  const safeClientName = clientName
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .slice(0, 50)

  const filePath =
    `invoices/${safeInvoiceNumber}/` +
    `SLIPA-${safeInvoiceNumber}-${safeClientName}.pdf`

  // ------------------------------------------------------------
  // 2. Upload to Supabase Storage
  // ------------------------------------------------------------

  const uploadUrl =
    `${SUPABASE_URL}/storage/v1/object/` +
    `${encodeURIComponent(SUPABASE_STORAGE_BUCKET)}/` +
    `${filePath
      .split('/')
      .map(encodeURIComponent)
      .join('/')}`

  console.info(
    `[Supabase Storage] Uploading PDF to bucket "${SUPABASE_STORAGE_BUCKET}".`
  )

  const response = await fetch(uploadUrl, {
    method: 'POST',

    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/pdf',
      'x-upsert': 'true',
    },

   body: new Uint8Array(buffer),
  })

  // ------------------------------------------------------------
  // 3. Handle upload failure
  // ------------------------------------------------------------

  if (!response.ok) {
    const errorText = await response.text()

    console.error(
      '[Supabase Storage] Upload failed:',
      response.status,
      errorText
    )

    throw new Error(
      `Supabase Storage upload failed (${response.status}): ${errorText}`
    )
  }

  // ------------------------------------------------------------
  // 4. Build public URL
  // ------------------------------------------------------------

  const publicUrl =
    `${SUPABASE_URL}/storage/v1/object/public/` +
    `${encodeURIComponent(SUPABASE_STORAGE_BUCKET)}/` +
    `${filePath
      .split('/')
      .map(encodeURIComponent)
      .join('/')}`

  console.info(
    '[Supabase Storage] PDF uploaded successfully.'
  )

  return publicUrl
}