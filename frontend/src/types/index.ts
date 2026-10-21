export type PaymentStatus = 'paid' | 'partial' | 'pending'
export type DocumentStatus = 'draft' | 'completed' | 'held' | 'cancelled'
export type StockStatus = 'healthy' | 'low' | 'out'

export interface BulkPriceTier {
  id: string
  from: number
  to: number | null
  price: number
}

export interface CrackersInfo {
  productType: string
  boxQuantity: number
  piecesPerBox: number
  purchaseUnit: string
  sellingUnit: string
  wholesalePrice?: number
  retailPrice?: number
  seasonalPrice?: number
  bulkPricing: BulkPriceTier[]
}

export interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  category: string
  brand?: string
  unit: string
  purchasePrice: number
  sellingPrice: number
  mrp?: number
  wholesalePrice?: number
  taxType: 'gst' | 'non-gst' | 'exempt'
  gstRate: number
  hsn?: string
  openingStock: number
  currentStock: number
  minStock: number
  godown?: string
  image?: string
  status: 'active' | 'inactive'
  isCrackers?: boolean
  crackers?: CrackersInfo
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  gstin?: string
  creditLimit?: number
  openingBalance?: number
  status: 'active' | 'inactive'
  createdAt: string
}

export interface Supplier {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  gstin?: string
  openingBalance?: number
  status: 'active' | 'inactive'
  createdAt: string
}

export interface InvoiceItem {
  id: string
  productId: string
  productName: string
  sku: string
  qty: number
  price: number
  discount: number
  gstRate: number
  gstAmount: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  date: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  cgst: number
  sgst: number
  igst: number
  grandTotal: number
  amountPaid: number
  paymentStatus: PaymentStatus
  paymentMethod?: string
  status: DocumentStatus
  notes?: string
  createdAt: string
}

export interface Quotation {
  id: string
  quotationNumber: string
  customerId: string
  customerName: string
  date: string
  validUntil: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  tax: number
  grandTotal: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'
  createdAt: string
}

export interface PurchaseItem extends InvoiceItem {
  purchasePrice: number
}

export interface Purchase {
  id: string
  billNumber: string
  supplierId: string
  supplierName: string
  supplierInvoiceNumber?: string
  date: string
  items: PurchaseItem[]
  subtotal: number
  discount: number
  cgst: number
  sgst: number
  grandTotal: number
  amountPaid: number
  paymentStatus: PaymentStatus
  paymentMethod?: string
  status: DocumentStatus
  notes?: string
  createdAt: string
}

export interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: string
  status: 'paid' | 'pending'
  createdAt: string
}

export interface ReturnItem {
  id: string
  productId: string
  productName: string
  sku: string
  qty: number
  price: number
  gstRate: number
  total: number
}

export interface SalesReturn {
  id: string
  returnNumber: string
  invoiceId: string
  invoiceNumber: string
  customerId: string
  customerName: string
  date: string
  items: ReturnItem[]
  total: number
  refundMethod: 'refund' | 'credit' | 'credit-note'
  reason: string
  createdAt: string
}

export interface PurchaseReturn {
  id: string
  returnNumber: string
  purchaseId: string
  billNumber: string
  supplierId: string
  supplierName: string
  date: string
  items: ReturnItem[]
  total: number
  refundMethod: 'refund' | 'credit' | 'credit-note'
  reason: string
  createdAt: string
}

export interface StockAdjustment {
  id: string
  productId: string
  productName: string
  type: 'in' | 'out'
  qty: number
  reason: string
  notes?: string
  date: string
}

export interface Godown {
  id: string
  name: string
  address?: string
  manager?: string
  description?: string
}

export interface ProductCategory {
  id: string
  name: string
  description?: string
}

export interface TaxSetting {
  id: string
  name: string
  rate: number
  type: 'cgst' | 'sgst' | 'igst' | 'custom'
  enabled: boolean
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'Owner' | 'Admin' | 'Manager' | 'Cashier' | 'Accountant' | 'Staff'
  status: 'active' | 'inactive'
  permissions: string[]
}

export interface PrinterSetting {
  id: string
  name: string
  type: string
  isDefault: boolean
  connected: boolean
}

export interface OnlineStoreSettings {
  storeName: string
  tagline: string
  logo?: string
  banner?: string
  contact: string
  email: string
  address: string
  theme: string
  status: 'online' | 'offline'
  productsPublished: string[]
}

export interface BusinessInfo {
  name: string
  logo?: string
  phone: string
  email: string
  address: string
  gstin: string
  currency: string
  invoicePrefix: string
  industry: string
}

export interface InvoiceSettings {
  template: string
  paperSize: string
  showLogo: boolean
  showGst: boolean
  showSignature: boolean
  showBankDetails: boolean
  footerText: string
  defaultPaymentTerms: string
}

export interface AppSettings {
  business: BusinessInfo
  invoice: InvoiceSettings
  taxes: TaxSetting[]
  users: User[]
  printers: PrinterSetting[]
  onlineStore: OnlineStoreSettings
}

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}
