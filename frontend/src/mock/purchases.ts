import type { Purchase, PurchaseItem, Supplier } from '@/types'
import { suppliers } from './suppliers'
import { products } from './products'
import { daysAgoISO } from '@/lib/format'

function line(
  productId: string,
  qty: number,
  price: number,
  discount = 0,
): PurchaseItem {
  const product = products.find((p) => p.id === productId)!
  const gstRate = product.gstRate
  const base = price * qty - discount
  const gstAmount = Math.round(base * (gstRate / 100))
  return {
    id: `pur-${productId}`,
    productId,
    productName: product.name,
    sku: product.sku,
    qty,
    price,
    purchasePrice: price,
    discount,
    gstRate,
    gstAmount,
    total: base + gstAmount,
  }
}

function build(
  n: number,
  supplier: Supplier,
  daysAgo: number,
  status: Purchase['status'],
  paymentStatus: Purchase['paymentStatus'],
): Purchase {
  const items = [line('p-001', 20, 1050), line('p-003', 15, 320), line('p-007', 10, 300)]
  const subtotal = items.reduce((s, i) => s + i.qty * i.price - i.discount, 0)
  const discount = 500
  const gstTotal = items.reduce((s, i) => s + i.gstAmount, 0)
  const cgst = Math.round(gstTotal / 2)
  const sgst = Math.round(gstTotal / 2)
  const grandTotal = subtotal - discount + cgst + sgst
  const date = daysAgoISO(daysAgo)
  const amountPaid =
    paymentStatus === 'paid' ? grandTotal : paymentStatus === 'partial' ? Math.round(grandTotal / 2) : 0
  return {
    id: `pur-${n}`,
    billNumber: `PUR-${2000 + n}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    supplierInvoiceNumber: `SF-${4000 + n}`,
    date,
    items,
    subtotal,
    discount,
    cgst,
    sgst,
    grandTotal,
    amountPaid,
    paymentStatus,
    paymentMethod: paymentStatus === 'paid' ? 'bank' : undefined,
    status,
    createdAt: date + 'T11:00:00.000Z',
  }
}

const days = [1, 2, 4, 6, 8, 10, 12, 15, 18, 21, 25, 28, 32, 36, 40]
const paidIdx = [0, 1, 3, 4, 6, 8, 10, 12, 14]
const partialIdx = [2, 5, 9, 11]

export const purchases: Purchase[] = days.map((d, i) =>
  build(
    i + 1,
    suppliers[i % suppliers.length],
    d,
    'completed',
    paidIdx.includes(i) ? 'paid' : partialIdx.includes(i) ? 'partial' : 'pending',
  ),
)
