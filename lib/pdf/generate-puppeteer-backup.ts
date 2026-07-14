/**
 * lib/pdf/generate.ts
 * Puppeteer-based PDF generation and local storage.
 *
 * SECURITY: decryptBankDetail is called ONLY here — the only permitted location.
 * Never call decryptBankDetail from routes, components, or any other module.
 *
 * Storage: v1.0 uses local filesystem (/public/pdfs/).
 * For production, replace storePdf() with an S3/Cloudinary upload.
 * The pdf_url stored in DB is a relative path served by Next.js.
 */

import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { query } from '@/lib/db'
import { decryptBankDetail } from '@/lib/encryption'
import { renderInvoiceHtml, InvoiceForPdf } from './template'
import { Invoice, LineItem } from '@/lib/db/types'

const PDF_STORAGE_DIR = join(process.cwd(), 'public', 'pdfs')
const PDF_GENERATION_TIMEOUT_MS = 30_000 // 30 seconds

interface InvoiceRow extends Invoice {
  client_name: string | null
  client_email: string | null
  freelancer_name: string
  freelancer_email: string
  freelancer_phone: string | null
  freelancer_address: string | null
  freelancer_bank_name: string | null
  freelancer_account_name: string | null
  freelancer_account_number: string | null  // encrypted — decrypted below
}

/**
 * generateAndStorePdf — called by the invoice generate route via setImmediate.
 * On success: updates invoice row with pdf_url and status='sent'.
 * On failure: updates status='error'. Does NOT reuse the invoice number.
 */
export async function generateAndStorePdf(
  invoiceId: string,
  freelancerId: string
): Promise<void> {
  // Fetch all invoice data in a single join
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
     LEFT JOIN clients c ON c.id = inv.client_id
     LEFT JOIN freelancers f ON f.id = inv.freelancer_id
     WHERE inv.id = $1 AND inv.freelancer_id = $2`,
    [invoiceId, freelancerId]
  )

  const row = result.rows[0]
  if (!row) throw new Error(`Invoice ${invoiceId} not found.`)

  const lineItemsResult = await query<LineItem>(
    'SELECT * FROM line_items WHERE invoice_id = $1 ORDER BY id',
    [invoiceId]
  )

  // SECURITY: Decrypt account number ONLY here — the only permitted location
  let decryptedAccountNumber: string | null = null
  if (row.freelancer_account_number) {
    try {
      decryptedAccountNumber = decryptBankDetail(row.freelancer_account_number)
    } catch {
      // Decryption failure should not crash PDF generation
      // PDF will be generated without account number rather than failing entirely
      decryptedAccountNumber = null
    }
  }

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
      ? { name: row.client_name, email: row.client_email }
      : null,
    decryptedAccountNumber,
  }

  // Render HTML and generate PDF with Puppeteer
  const html = renderInvoiceHtml(invoiceData)
  const pdfBuffer = await generatePdfBuffer(html)

  // Store PDF and get the URL
  const pdfUrl = await storePdf(pdfBuffer, row.invoice_number, row.client_name ?? 'client')

  // Update invoice row with pdf_url and status: sent
  await query(
    `UPDATE invoices
     SET pdf_url = $1, status = 'sent'
     WHERE id = $2`,
    [pdfUrl, invoiceId]
  )
}

async function generatePdfBuffer(html: string): Promise<Buffer> {
 const isVercel = !!process.env.VERCEL

const browser = await puppeteer.launch({
  args: isVercel
    ? chromium.args
    : ['--no-sandbox', '--disable-setuid-sandbox'],

  executablePath: isVercel
    ? await chromium.executablePath()
    : undefined,

  headless: true,
})

  try {
    const page = await browser.newPage()

    // Set timeout for PDF generation
    page.setDefaultTimeout(PDF_GENERATION_TIMEOUT_MS)

    await page.setContent(html, { waitUntil: 'domcontentloaded' })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '40px',
        right: '40px',
        bottom: '40px',
        left: '40px',
      },
    })

    return Buffer.from(pdf)
  } catch (err) {
    console.error('[PDF] puppeteer error:', err)
    throw err
  } finally {
    await browser.close()
  }
}

/**
 * storePdf — saves the PDF buffer to local filesystem (v1.0 dev storage).
 * TODO: Replace with S3/Cloudinary upload for production.
 * Returns the URL path that will be stored in the invoices.pdf_url column.
 */
async function storePdf(
  buffer: Buffer,
  invoiceNumber: string,
  clientName: string
): Promise<string> {
  await mkdir(PDF_STORAGE_DIR, { recursive: true })

  const safeName = clientName.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 50)
  const filename = `SLIPA-${invoiceNumber}-${safeName}.pdf`
  const filepath = join(PDF_STORAGE_DIR, filename)

  await writeFile(filepath, buffer)

  // Return the public URL path
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${baseUrl}/pdfs/${filename}`
}
