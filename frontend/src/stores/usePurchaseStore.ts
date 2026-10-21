import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { purchases } from '@/mock'
import type { Purchase, PurchaseItem } from '@/types'
import { uid } from '@/lib/utils'
import { toast } from './useToastStore'
import { useSupplierStore } from './useSupplierStore'

export interface DraftPurchase {
  supplierId: string
  items: PurchaseItem[]
  subtotal: number
  discount: number
  cgst: number
  sgst: number
  grandTotal: number
}

function nextBillNumber(list: Purchase[]): string {
  const max = list.reduce((m, p) => {
    const num = Number(p.billNumber.replace(/\D/g, ''))
    return Math.max(m, Number.isFinite(num) ? num : 0)
  }, 2000)
  return `PUR-${max + 1}`
}

interface PurchaseState {
  purchases: Purchase[]
  createPurchase: (
    data: DraftPurchase,
    supplierInvoiceNumber: string,
    payment?: { method: string; amount: number },
  ) => Purchase
  updatePurchase: (id: string, patch: Partial<Purchase>) => void
  recordPayment: (id: string, amount: number, method: string) => void
  cancelPurchase: (id: string) => void
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      purchases,
      createPurchase: (data, supplierInvoiceNumber, payment) => {
        const supplier = useSupplierStore
          .getState()
          .suppliers.find((s) => s.id === data.supplierId)
        const number = nextBillNumber(get().purchases)
        const amountPaid = payment ? Math.min(payment.amount, data.grandTotal) : 0
        const bill: Purchase = {
          id: uid('pur'),
          billNumber: number,
          supplierId: data.supplierId,
          supplierName: supplier?.name ?? 'Unknown Supplier',
          supplierInvoiceNumber,
          date: new Date().toISOString(),
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          cgst: data.cgst,
          sgst: data.sgst,
          grandTotal: data.grandTotal,
          amountPaid,
          paymentStatus:
            amountPaid >= data.grandTotal
              ? 'paid'
              : amountPaid > 0
                ? 'partial'
                : 'pending',
          paymentMethod: payment?.method,
          status: 'completed',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ purchases: [bill, ...state.purchases] }))
        toast.success('Purchase bill created', `${number} saved.`)
        return bill
      },
      updatePurchase: (id, patch) => {
        set((state) => ({
          purchases: state.purchases.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        }))
        toast.success('Purchase updated')
      },
      recordPayment: (id, amount, method) => {
        set((state) => ({
          purchases: state.purchases.map((p) => {
            if (p.id !== id) return p
            const paid = Math.min(p.amountPaid + amount, p.grandTotal)
            return {
              ...p,
              amountPaid: paid,
              paymentMethod: method,
              paymentStatus:
                paid >= p.grandTotal ? 'paid' : paid > 0 ? 'partial' : 'pending',
            }
          }),
        }))
        toast.success('Payment recorded')
      },
      cancelPurchase: (id) => {
        set((state) => ({
          purchases: state.purchases.map((p) =>
            p.id === id ? { ...p, status: 'cancelled' } : p,
          ),
        }))
        toast.success('Purchase cancelled')
      },
    }),
    { name: 'bizflow:purchases' },
  ),
)
