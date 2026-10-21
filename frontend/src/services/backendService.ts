import { api } from './apiClient'
import type { Product, Customer, Supplier, Invoice, Purchase, Expense, AppSettings, BusinessInfo } from '@/types'

export const backendProductService = {
  list: () => api.get<Product[]>('/products'),
  get: (id: string) => api.get<Product>(`/products/${id}`),
  search: (q: string) => api.get<Product[]>(`/products?q=${encodeURIComponent(q)}`),
  create: (p: Partial<Product>) => api.post<Product>('/products', p),
  update: (id: string, p: Partial<Product>) => api.put<Product>(`/products/${id}`, p),
  delete: (id: string) => api.delete<void>(`/products/${id}`),
  duplicate: (id: string) => api.post<Product>(`/products/${id}/duplicate`),
  adjustStock: (productId: string, type: 'in' | 'out', qty: number, reason?: string, notes?: string) =>
    api.post<Product>('/products/adjust-stock', { productId, type, qty, reason, notes }),
}

export const backendCustomerService = {
  list: () => api.get<Customer[]>('/customers'),
  get: (id: string) => api.get<Customer>(`/customers/${id}`),
  search: (q: string) => api.get<Customer[]>(`/customers?q=${encodeURIComponent(q)}`),
  create: (c: Partial<Customer>) => api.post<Customer>('/customers', c),
  update: (id: string, c: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, c),
  delete: (id: string) => api.delete<void>(`/customers/${id}`),
  getLedger: (id: string) => api.get<any>(`/customers/${id}/ledger`),
}

export const backendSupplierService = {
  list: () => api.get<Supplier[]>('/suppliers'),
  get: (id: string) => api.get<Supplier>(`/suppliers/${id}`),
  search: (q: string) => api.get<Supplier[]>(`/suppliers?q=${encodeURIComponent(q)}`),
  create: (s: Partial<Supplier>) => api.post<Supplier>('/suppliers', s),
  update: (id: string, s: Partial<Supplier>) => api.put<Supplier>(`/suppliers/${id}`, s),
  delete: (id: string) => api.delete<void>(`/suppliers/${id}`),
  getLedger: (id: string) => api.get<any>(`/suppliers/${id}/ledger`),
}

export const backendInvoiceService = {
  list: () => api.get<Invoice[]>('/invoices'),
  get: (id: string) => api.get<Invoice>(`/invoices/${id}`),
  create: (invoice: any) => api.post<Invoice>('/invoices', invoice),
  update: (id: string, patch: Partial<Invoice>) => api.put<Invoice>(`/invoices/${id}`, patch),
  recordPayment: (id: string, amount: number, method: string) =>
    api.post<Invoice>(`/invoices/${id}/pay`, { amount, method }),
  cancel: (id: string) => api.post<Invoice>(`/invoices/${id}/cancel`),
  duplicate: (id: string) => api.post<Invoice>(`/invoices/${id}/duplicate`),
}

export const backendPurchaseService = {
  list: () => api.get<Purchase[]>('/purchases'),
  get: (id: string) => api.get<Purchase>(`/purchases/${id}`),
  create: (purchase: any) => api.post<Purchase>('/purchases', purchase),
  update: (id: string, patch: Partial<Purchase>) => api.put<Purchase>(`/purchases/${id}`, patch),
  recordPayment: (id: string, amount: number, method: string) =>
    api.post<Purchase>(`/purchases/${id}/pay`, { amount, method }),
  cancel: (id: string) => api.post<Purchase>(`/purchases/${id}/cancel`),
}

export const backendExpenseService = {
  list: (from?: string, to?: string) => {
    const params = from && to ? `?from=${from}&to=${to}` : ''
    return api.get<Expense[]>(`/expenses${params}`)
  },
  get: (id: string) => api.get<Expense>(`/expenses/${id}`),
  create: (expense: Partial<Expense>) => api.post<Expense>('/expenses', expense),
  update: (id: string, patch: Partial<Expense>) => api.put<Expense>(`/expenses/${id}`, patch),
  delete: (id: string) => api.delete<void>(`/expenses/${id}`),
  getBreakdown: () => api.get<{ name: string; amount: number }[]>('/expenses/breakdown'),
}

export const backendReportService = {
  getSalesSummary: (from?: string, to?: string) =>
    api.get<any>(`/reports/sales-summary?from=${from || ''}&to=${to || ''}`),
  getDailySeries: (from?: string, to?: string) =>
    api.get<any>(`/reports/daily-series?from=${from || ''}&to=${to || ''}`),
  getTopProducts: (from?: string, to?: string, limit = 6) =>
    api.get<any>(`/reports/top-products?from=${from || ''}&to=${to || ''}&limit=${limit}`),
  getGstSummary: (from?: string, to?: string) =>
    api.get<any>(`/reports/gst-summary?from=${from || ''}&to=${to || ''}`),
  getCustomers: (from?: string, to?: string) =>
    api.get<any>(`/reports/customers?from=${from || ''}&to=${to || ''}`),
}

export const backendDashboardService = {
  getStats: () => api.get<any>('/dashboard/stats'),
}

export const backendSettingsService = {
  getSettings: () => api.get<AppSettings>('/settings'),
  getBusiness: () => api.get<BusinessInfo>('/settings/business'),
  updateBusiness: (business: Partial<BusinessInfo>) => api.put<BusinessInfo>('/settings/business', business),
  updateInvoice: (invoice: any) => api.put<any>('/settings/invoice', invoice),
  saveTaxes: (taxes: any[]) => api.put<any[]>('/settings/taxes', taxes),
  saveUsers: (users: any[]) => api.put<any[]>('/settings/users', users),
  savePrinters: (printers: any[]) => api.put<any[]>('/settings/printers', printers),
  updateOnlineStore: (store: any) => api.put<any>('/settings/online-store', store),
}
