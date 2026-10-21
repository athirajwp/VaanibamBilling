import type { InvoiceItem, Product } from '@/types'
import { uid } from './utils'

export function computeLine(
  product: Product,
  qty: number,
  price: number,
  discount: number,
): InvoiceItem {
  const base = qty * price - discount
  const gstRate = product.taxType === 'exempt' ? 0 : product.gstRate
  const gstAmount = Math.round(base * (gstRate / 100))
  return {
    id: uid('li'),
    productId: product.id,
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

export interface InvoiceTotals {
  subtotal: number
  discount: number
  cgst: number
  sgst: number
  igst: number
  grandTotal: number
}

export function computeTotals(items: InvoiceItem[], additionalDiscount = 0): InvoiceTotals {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const lineDiscount = items.reduce((s, i) => s + i.discount, 0)
  const discount = lineDiscount + additionalDiscount
  const taxable = Math.max(0, subtotal - discount)
  const gstTotal = items.reduce((s, i) => s + i.gstAmount, 0)
  const cgst = Math.round(gstTotal / 2)
  const sgst = Math.round(gstTotal / 2)
  const igst = 0
  const grandTotal = taxable + gstTotal
  return { subtotal, discount, cgst, sgst, igst, grandTotal }
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
