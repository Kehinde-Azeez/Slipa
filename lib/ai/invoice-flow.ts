export const FLOW = [
'clientName',
'clientEmail',
'description',
'quantity',
'unitPrice',
'currency',
'amountPaid',
'paymentTerms',
'vatOptIn',
'discountAmount',
'notes',
] as const

export type FlowField = typeof FLOW[number]
