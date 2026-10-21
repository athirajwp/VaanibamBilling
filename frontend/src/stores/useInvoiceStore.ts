import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { invoices, quotations } from '@/mock'
import type {
  Invoice,
  InvoiceItem,
  Quotation,
  SalesReturn,
  ReturnItem,
  PaymentStatus,
  DocumentStatus,
} from '@/types'
import { uid } from '@/lib/utils'
import { toast } from './useToastStore'
import { useBusinessStore } from './useBusinessStore'
import { useCustomerStore } from './useCustomerStore'

function nextDocNumber(
  list: { id: string; invoiceNumber?: string; quotationNumber?: string }[],
  prefix: string,
  key: 'invoiceNumber' | 'quotationNumber',
  base: number,
): string {
  const max = list.reduce((m, doc) => {
    const num = Number((doc[key] ?? '').replace(/\D/g, ''))
    return Math.max(m, Number.isFinite(num) ? num : 0)
  }, base)
  return `${prefix}-${max + 1}`
}

export interface DraftInvoice {
  customerId: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  cgst: number
  sgst: number
  igst: number
  grandTotal: number
}

function findCustomer(id: string) {
  return useCustomerStore.getState().customers.find((c) => c.id === id)
}

interface InvoiceState {
  invoices: Invoice[]
  quotations: Quotation[]
  returns: SalesReturn[]
  createInvoice: (
    data: DraftInvoice,
    status: DocumentStatus,
    payment?: { method: string; amount: number },
  ) => Invoice
  updateInvoice: (id: string, patch: Partial<Invoice>) => void
  recordPayment: (id: string, amount: number, method: string) => void
  cancelInvoice: (id: string) => void
  duplicateInvoice: (id: string) => void
  createQuotation: (
    data: DraftInvoice,
    customerId: string,
    validUntil?: string,
  ) => Quotation
  updateQuotationStatus: (id: string, status: Quotation['status']) => void
  convertQuotation: (id: string) => Invoice | null
  deleteQuotation: (id: string) => void
  createReturn: (data: Omit<SalesReturn, 'id' | 'createdAt'>) => void
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices,
      quotations,
      returns: [],
      createInvoice: (data, status, payment) => {
        const prefix = useBusinessStore.getState().business.invoicePrefix || 'INV'
        const number = nextDocNumber(get().invoices, prefix, 'invoiceNumber', 1000)
        const amountPaid = payment ? Math.min(payment.amount, data.grandTotal) : 0
        const paymentStatus: PaymentStatus =
          status === 'draft'
            ? 'pending'
            : amountPaid >= data.grandTotal
              ? 'paid'
              : amountPaid > 0
                ? 'partial'
                : 'pending'
        const invoice: Invoice = {
          id: uid('inv'),
          invoiceNumber: number,
          customerId: data.customerId,
          customerName: findCustomer(data.customerId)?.name ?? 'Walk-in Customer',
          date: new Date().toISOString(),
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          cgst: data.cgst,
          sgst: data.sgst,
          igst: data.igst,
          grandTotal: data.grandTotal,
          amountPaid,
          paymentStatus,
          paymentMethod: payment?.method,
          status,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ invoices: [invoice, ...state.invoices] }))
        return invoice
      },
      updateInvoice: (id, patch) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...patch } : inv,
          ),
        }))
      },
      recordPayment: (id, amount, method) => {
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.id !== id) return inv
            const paid = Math.min(inv.amountPaid + amount, inv.grandTotal)
            return {
              ...inv,
              amountPaid: paid,
              paymentMethod: method,
              paymentStatus:
                paid >= inv.grandTotal ? 'paid' : paid > 0 ? 'partial' : 'pending',
            }
          }),
        }))
        toast.success('Payment recorded', 'Payment status updated.')
      },
      cancelInvoice: (id) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id
              ? { ...inv, status: 'cancelled', paymentStatus: 'pending' }
              : inv,
          ),
        }))
        toast.success('Invoice cancelled')
      },
      duplicateInvoice: (id) => {
        const source = get().invoices.find((inv) => inv.id === id)
        if (!source) return
        const prefix = useBusinessStore.getState().business.invoicePrefix || 'INV'
        const number = nextDocNumber(get().invoices, prefix, 'invoiceNumber', 1000)
        const copy: Invoice = {
          ...source,
          id: uid('inv'),
          invoiceNumber: number,
          status: 'draft',
          amountPaid: 0,
          paymentStatus: 'pending',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ invoices: [copy, ...state.invoices] }))
        toast.success('Invoice duplicated', `${number} created as draft.`)
      },
      createQuotation: (data, customerId, validUntil) => {
        const customer = findCustomer(customerId)
        const number = nextDocNumber(get().quotations, 'QT', 'quotationNumber', 100)
        const quotation: Quotation = {
          id: uid('quo'),
          quotationNumber: number,
          customerId,
          customerName: customer?.name ?? 'Walk-in Customer',
          date: new Date().toISOString(),
          validUntil: validUntil ?? new Date(Date.now() + 7 * 86400000).toISOString(),
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          tax: data.cgst + data.sgst + data.igst,
          grandTotal: data.grandTotal,
          status: 'sent',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ quotations: [quotation, ...state.quotations] }))
        toast.success('Quotation created', `${number} saved.`)
        return quotation
      },
      updateQuotationStatus: (id, status) => {
        set((state) => ({
          quotations: state.quotations.map((q) =>
            q.id === id ? { ...q, status } : q,
          ),
        }))
        toast.success('Quotation updated', `Status set to ${status}.`)
      },
      convertQuotation: (id) => {
        const quotation = get().quotations.find((q) => q.id === id)
        if (!quotation) return null
        const prefix = useBusinessStore.getState().business.invoicePrefix || 'INV'
        const number = nextDocNumber(get().invoices, prefix, 'invoiceNumber', 1000)
        const invoice: Invoice = {
          id: uid('inv'),
          invoiceNumber: number,
          customerId: quotation.customerId,
          customerName: quotation.customerName,
          date: new Date().toISOString(),
          items: quotation.items,
          subtotal: quotation.subtotal,
          discount: quotation.discount,
          cgst: Math.round(quotation.tax / 2),
          sgst: Math.round(quotation.tax / 2),
          igst: 0,
          grandTotal: quotation.grandTotal,
          amountPaid: 0,
          paymentStatus: 'pending',
          status: 'completed',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          invoices: [invoice, ...state.invoices],
          quotations: state.quotations.map((q) =>
            q.id === id ? { ...q, status: 'converted' } : q,
          ),
        }))
        toast.success('Quotation converted', `${number} created.`)
        return invoice
      },
      deleteQuotation: (id) => {
        set((state) => ({
          quotations: state.quotations.filter((q) => q.id !== id),
        }))
        toast.success('Quotation deleted')
      },
      createReturn: (data) => {
        const ret: SalesReturn = {
          ...data,
          id: uid('ret'),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ returns: [ret, ...state.returns] }))
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.id !== data.invoiceId) return inv
            const refunded = ret.items.reduce((s, it) => s + it.total, 0)
            const amountPaid = Math.max(0, inv.amountPaid - refunded)
            return {
              ...inv,
              amountPaid,
              paymentStatus:
                amountPaid >= inv.grandTotal
                  ? 'paid'
                  : amountPaid > 0
                    ? 'partial'
                    : 'pending',
            }
          }),
        }))
        toast.success('Return processed', `${ret.returnNumber} created.`)
      },
    }),
    { name: 'bizflow:invoices' },
  ),
)

export type { ReturnItem }
