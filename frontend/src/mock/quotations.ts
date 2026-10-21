import type { Quotation, InvoiceItem, Customer } from '@/types'
import { customers } from './customers'
import { products } from './products'
import { daysAgoISO, addDaysISO } from '@/lib/format'

function line(productId: string, qty: number, price: number): InvoiceItem {
  const product = products.find((p) => p.id === productId)!
  const base = price * qty
  const gstAmount = Math.round(base * (product.gstRate / 100))
  return {
    id: `q-${productId}`,
    productId,
    productName: product.name,
    sku: product.sku,
    qty,
    price,
    discount: 0,
    gstRate: product.gstRate,
    gstAmount,
    total: base + gstAmount,
  }
}

function build(
  n: number,
  customer: Customer,
  daysAgo: number,
  status: Quotation['status'],
): Quotation {
  const items = [line('p-001', 1, 1200), line('p-013', 3, 500), line('p-015', 4, 180)]
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
  const tax = items.reduce((s, i) => s + i.gstAmount, 0)
  const discount = 0
  const grandTotal = subtotal - discount + tax
  const date = daysAgoISO(daysAgo)
  return {
    id: `quo-${n}`,
    quotationNumber: `QT-${100 + n}`,
    customerId: customer.id,
    customerName: customer.name,
    date,
    validUntil: addDaysISO(date, 7),
    items,
    subtotal,
    discount,
    tax,
    grandTotal,
    status,
    createdAt: date + 'T09:30:00.000Z',
  }
}

const statuses: Quotation['status'][] = [
  'sent', 'accepted', 'draft', 'expired', 'converted', 'rejected',
  'sent', 'accepted', 'draft', 'converted',
]

export const quotations: Quotation[] = statuses.map((s, i) =>
  build(i + 1, customers[(i % 13) + 1], i * 2, s),
)
