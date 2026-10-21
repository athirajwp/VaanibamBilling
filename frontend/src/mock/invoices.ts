import type { Invoice, InvoiceItem, Customer } from '@/types'
import { customers } from './customers'
import { products } from './products'
import { daysAgoISO } from '@/lib/format'

function line(
  productId: string,
  qty: number,
  price: number,
  discount = 0,
): InvoiceItem {
  const product = products.find((p) => p.id === productId)!
  const gstRate = product.gstRate
  const base = price * qty - discount
  const gstAmount = Math.round(base * (gstRate / 100))
  return {
    id: `${productId}-${qty}-${Math.random().toString(36).slice(2, 6)}`,
    productId,
    productName: product.name,
    sku: product.sku,
    qty,
    price,
    discount,
    gstRate,
    gstAmount,
    total: base + gstAmount,
  }
}

function build(
  n: number,
  customer: Customer,
  daysAgo: number,
  status: Invoice['status'],
  paymentStatus: Invoice['paymentStatus'],
  partial?: number,
): Invoice {
  const items = [line('p-001', 2, 1200, 50), line('p-003', 5, 400)]
  const subtotal = items.reduce((s, i) => s + i.qty * i.price - i.discount, 0)
  const discount = 50
  const gstTotal = items.reduce((s, i) => s + i.gstAmount, 0)
  const cgst = Math.round(gstTotal / 2)
  const sgst = Math.round(gstTotal / 2)
  const grandTotal = subtotal - discount + cgst + sgst
  const date = daysAgoISO(daysAgo)
  const amountPaid =
    paymentStatus === 'paid' ? grandTotal : paymentStatus === 'partial' ? (partial ?? Math.round(grandTotal / 2)) : 0
  return {
    id: `inv-${n}`,
    invoiceNumber: `INV-${1000 + n}`,
    customerId: customer.id,
    customerName: customer.name,
    date,
    items,
    subtotal,
    discount,
    cgst,
    sgst,
    igst: 0,
    grandTotal,
    amountPaid,
    paymentStatus,
    paymentMethod: paymentStatus === 'paid' ? 'cash' : paymentStatus === 'partial' ? 'upi' : undefined,
    status,
    createdAt: date + 'T10:00:00.000Z',
  }
}

const paid = [0, 1, 3, 5, 6, 8, 10, 12, 14, 16, 18, 20, 21, 23, 25]
const partial = [2, 7, 11, 15, 22, 26]
const pending = [4, 9, 13, 17, 19, 24, 27, 28, 29]

export const invoices: Invoice[] = [
  ...paid.map((d, i) => build(i + 1, customers[(i % 13) + 1], d, 'completed', 'paid')),
  ...partial.map((d, i) => build(20 + i + 1, customers[(i % 12) + 2], d, 'completed', 'partial')),
  ...pending.map((d, i) => build(27 + i + 1, customers[(i % 10) + 3], d, 'completed', 'pending')),
]
  .sort((a, b) => b.date.localeCompare(a.date))

export const nextInvoiceNumber = (prefix: string): string => {
  const max = invoices.reduce((m, inv) => {
    const num = Number(inv.invoiceNumber.replace(/\D/g, ''))
    return Math.max(m, Number.isFinite(num) ? num : 0)
  }, 1000)
  return `${prefix}-${max + 1}`
}
