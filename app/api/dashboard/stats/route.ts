import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const freelancer = await requireAuth(req)
    const totalInvoicesResult = await query(
  `
  SELECT COUNT(*) AS total
  FROM invoices
  WHERE freelancer_id = $1
  `,
  [freelancer.id]
)

  const revenueResult = await query(
  `
  SELECT COALESCE(SUM(total_amount), 0) AS revenue
  FROM invoices
  WHERE status = 'sent'
    AND freelancer_id = $1
  `,
  [freelancer.id]
)

   const outstandingResult = await query(
  `
  SELECT COALESCE(SUM(balance_due), 0) AS outstanding
  FROM invoices
  WHERE status = 'sent'
    AND freelancer_id = $1
  `,
  [freelancer.id]
)

    return Response.json({
      totalInvoices: Number(totalInvoicesResult.rows[0]?.total ?? 0),
      revenue: Number(revenueResult.rows[0]?.revenue ?? 0),
      outstanding: Number(outstandingResult.rows[0]?.outstanding ?? 0),
      defaultCurrency: freelancer.default_currency || 'NGN',
    })
  } catch (error) {
    console.error('[Dashboard Stats]', error)

    return Response.json(
      {
        error: 'Unable to load dashboard statistics',
      },
      {
        status: 500,
      }
    )
  }
}