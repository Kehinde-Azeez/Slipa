/**
 * lib/pdf/pdfshift.ts
 *
 * Handles communication with PDFShift.
 *
 * Responsibility:
 * HTML -> PDF Buffer
 *
 * PDFShift authentication uses the X-API-Key header.
 */

export async function generatePdfBuffer(
  html: string
): Promise<Buffer> {
  const apiKey = process.env.PDFSHIFT_API_KEY

  console.log(
    '[PDFShift] API key configured:',
    Boolean(apiKey),
    'length:',
    apiKey?.length ?? 0
  )

  if (!apiKey) {
    throw new Error('PDFSHIFT_API_KEY is missing.')
  }

  const response = await fetch(
    'https://api.pdfshift.io/v3/convert/pdf',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },

      body: JSON.stringify({
        source: html,
        sandbox: false,
        landscape: false,
        use_print: true,
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()

    console.error(
      `[PDFShift] API request failed (${response.status}):`,
      errorText
    )

    throw new Error(
      `PDFShift Error (${response.status}): ${errorText}`
    )
  }

  const arrayBuffer = await response.arrayBuffer()

  return Buffer.from(arrayBuffer)
}