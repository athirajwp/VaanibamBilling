import { useProductStore } from '@/stores/useProductStore'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { useSupplierStore } from '@/stores/useSupplierStore'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import { usePurchaseStore } from '@/stores/usePurchaseStore'
import { useExpenseStore } from '@/stores/useExpenseStore'
import type { Product, Customer, Supplier, Invoice, Purchase, Expense } from '@/types'

function delay<T>(data: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

export const productService = {
  list: async (): Promise<Product[]> => delay(useProductStore.getState().products),
  get: async (id: string): Promise<Product | undefined> =>
    delay(useProductStore.getState().products.find((p) => p.id === id)),
  search: async (q: string): Promise<Product[]> => {
    const query = q.trim().toLowerCase()
    const list = useProductStore.getState().products
    if (!query) return delay(list)
    return delay(
      list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          (p.barcode ?? '').includes(query),
      ),
    )
  },
}

export const customerService = {
  list: async (): Promise<Customer[]> => delay(useCustomerStore.getState().customers),
  get: async (id: string): Promise<Customer | undefined> =>
    delay(useCustomerStore.getState().customers.find((c) => c.id === id)),
}

export const supplierService = {
  list: async (): Promise<Supplier[]> => delay(useSupplierStore.getState().suppliers),
  get: async (id: string): Promise<Supplier | undefined> =>
    delay(useSupplierStore.getState().suppliers.find((s) => s.id === id)),
}

export const invoiceService = {
  list: async (): Promise<Invoice[]> => delay(useInvoiceStore.getState().invoices),
  get: async (id: string): Promise<Invoice | undefined> =>
    delay(useInvoiceStore.getState().invoices.find((i) => i.id === id)),
}

export const purchaseService = {
  list: async (): Promise<Purchase[]> => delay(usePurchaseStore.getState().purchases),
  get: async (id: string): Promise<Purchase | undefined> =>
    delay(usePurchaseStore.getState().purchases.find((p) => p.id === id)),
}

export const expenseService = {
  list: async (): Promise<Expense[]> => delay(useExpenseStore.getState().expenses),
}
