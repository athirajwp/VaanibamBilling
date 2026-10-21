import { useInvoiceStore } from '@/stores/useInvoiceStore'
import { usePurchaseStore } from '@/stores/usePurchaseStore'
import { useExpenseStore } from '@/stores/useExpenseStore'
import { useProductStore } from '@/stores/useProductStore'
import { useCustomerStore } from '@/stores/useCustomerStore'
import type { Invoice, Purchase, Expense, Customer } from '@/types'

export interface DateRange {
  from: string
  to: string
}

export interface SalesSummary {
  sales: number
  purchases: number
  profit: number
  orders: number
  outstanding: number
}

export function withinRange(date: string, range: DateRange): boolean {
  const d = date.slice(0, 10)
  return d >= range.from && d <= range.to
}

export function reportService() {
  const invoices = useInvoiceStore.getState().invoices
  const purchases = usePurchaseStore.getState().purchases
  const expenses = useExpenseStore.getState().expenses
  const products = useProductStore.getState().products
  const customers = useCustomerStore.getState().customers

  return {
    sales(range: DateRange): Invoice[] {
      return invoices
        .filter((i) => i.status !== 'cancelled' && withinRange(i.date, range))
        .sort((a, b) => a.date.localeCompare(b.date))
    },
    purchasesList(range: DateRange): Purchase[] {
      return purchases
        .filter((p) => p.status !== 'cancelled' && withinRange(p.date, range))
        .sort((a, b) => a.date.localeCompare(b.date))
    },
    expensesList(range: DateRange): Expense[] {
      return expenses
        .filter((e) => withinRange(e.date, range))
        .sort((a, b) => a.date.localeCompare(b.date))
    },
    summary(range: DateRange): SalesSummary {
      const salesList = this.sales(range)
      const purchaseList = this.purchasesList(range)
      const costOfGoods = salesList.reduce(
        (sum, inv) =>
          sum +
          inv.items.reduce((s, it) => {
            const product = products.find((p) => p.id === it.productId)
            return s + (product?.purchasePrice ?? it.price) * it.qty
          }, 0),
        0,
      )
      const sales = salesList.reduce((s, i) => s + i.grandTotal, 0)
      const purchasesTotal = purchaseList.reduce((s, p) => s + p.grandTotal, 0)
      const outstanding = customers.reduce((s, c) => s + (c.openingBalance ?? 0), 0)
      return {
        sales,
        purchases: purchasesTotal,
        profit: sales - costOfGoods,
        orders: salesList.length,
        outstanding,
      }
    },
    dailySeries(range: DateRange): { date: string; sales: number; purchases: number; profit: number }[] {
      const salesList = this.sales(range)
      const purchaseList = this.purchasesList(range)
      const map = new Map<string, { sales: number; purchases: number; profit: number }>()
      for (const inv of salesList) {
        const key = inv.date.slice(0, 10)
        const item = map.get(key) ?? { sales: 0, purchases: 0, profit: 0 }
        item.sales += inv.grandTotal
        const cost = inv.items.reduce((s, it) => {
          const product = products.find((p) => p.id === it.productId)
          return s + (product?.purchasePrice ?? it.price) * it.qty
        }, 0)
        item.profit += inv.grandTotal - cost
        map.set(key, item)
      }
      for (const bill of purchaseList) {
        const key = bill.date.slice(0, 10)
        const item = map.get(key) ?? { sales: 0, purchases: 0, profit: 0 }
        item.purchases += bill.grandTotal
        map.set(key, item)
      }
      return [...map.entries()].map(([date, v]) => ({ date, ...v }))
    },
    topProducts(range: DateRange) {
      const salesList = this.sales(range)
      const counter = new Map<
        string,
        { productName: string; units: number; revenue: number; profit: number }
      >()
      for (const inv of salesList) {
        for (const it of inv.items) {
          const product = products.find((p) => p.id === it.productId)
          const entry = counter.get(it.productId) ?? {
            productName: it.productName,
            units: 0,
            revenue: 0,
            profit: 0,
          }
          entry.units += it.qty
          entry.revenue += it.price * it.qty - it.discount
          entry.profit +=
            it.price * it.qty - it.discount - (product?.purchasePrice ?? it.price) * it.qty
          counter.set(it.productId, entry)
        }
      }
      return [...counter.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6)
    },
    customers(range: DateRange): (Customer & { totalSales: number; totalPaid: number; outstanding: number; lastPurchase?: string })[] {
      const salesList = this.sales(range)
      return customers.map((c) => {
        const cInvoices = salesList.filter((i) => i.customerId === c.id)
        const totalSales = cInvoices.reduce((s, i) => s + i.grandTotal, 0)
        const totalPaid = cInvoices.reduce((s, i) => s + i.amountPaid, 0)
        return {
          ...c,
          totalSales,
          totalPaid,
          outstanding: totalSales - totalPaid + (c.openingBalance ?? 0),
          lastPurchase: cInvoices[0]?.date,
        }
      })
    },
    inventory() {
      return products.map((p) => {
        const status =
          p.currentStock <= 0 ? 'out' : p.currentStock <= p.minStock ? 'low' : 'healthy'
        return { ...p, stockStatus: status }
      })
    },
  }
}

export const expenseReportService = {
  byCategory() {
    const list = useExpenseStore.getState().expenses
    const map = new Map<string, number>()
    for (const e of list) map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    return [...map.entries()].map(([name, amount]) => ({ name, amount }))
  },
  total() {
    return useExpenseStore.getState().expenses.reduce((s, e) => s + e.amount, 0)
  },
}

export const gstReportService = {
  summary(range: DateRange) {
    const sales = useInvoiceStore
      .getState()
      .invoices.filter((i) => i.status !== 'cancelled' && withinRange(i.date, range))
    const purchases = usePurchaseStore
      .getState()
      .purchases.filter((p) => p.status !== 'cancelled' && withinRange(p.date, range))
    const taxableSales = sales.reduce(
      (s, i) => s + i.subtotal - i.discount,
      0,
    )
    const cgst = sales.reduce((s, i) => s + i.cgst, 0)
    const sgst = sales.reduce((s, i) => s + i.sgst, 0)
    const igst = sales.reduce((s, i) => s + i.igst, 0)
    const purchaseTaxable = purchases.reduce(
      (s, p) => s + p.subtotal - p.discount,
      0,
    )
    const purchaseCgst = purchases.reduce((s, p) => s + p.cgst, 0)
    const purchaseSgst = purchases.reduce((s, p) => s + p.sgst, 0)
    return {
      taxableSales,
      cgst,
      sgst,
      igst,
      totalGst: cgst + sgst + igst,
      purchaseTaxable,
      purchaseCgst,
      purchaseSgst,
      purchaseGst: purchaseCgst + purchaseSgst,
      netPayable: cgst + sgst + igst - purchaseCgst - purchaseSgst,
    }
  },
}
