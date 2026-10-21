import type { AppSettings } from '@/types'

export const defaultSettings: AppSettings = {
  business: {
    name: 'Sri Lakshmi Crackers',
    logo: '',
    phone: '04562 223344',
    email: 'srilakshmicrackers@gmail.com',
    address: 'No. 12, GST Main Road, Sivakasi, Tamil Nadu - 626123',
    gstin: '33AABCSL1234F1Z5',
    currency: 'INR',
    invoicePrefix: 'INV',
    industry: 'Crackers',
  },
  invoice: {
    template: 'modern',
    paperSize: 'a4',
    showLogo: true,
    showGst: true,
    showSignature: true,
    showBankDetails: true,
    footerText: 'Thank you for your business!',
    defaultPaymentTerms: 'Due on receipt',
  },
  taxes: [
    { id: 'tax-1', name: 'GST 18%', rate: 18, type: 'custom', enabled: true },
    { id: 'tax-2', name: 'GST 12%', rate: 12, type: 'custom', enabled: true },
    { id: 'tax-3', name: 'GST 5%', rate: 5, type: 'custom', enabled: true },
    { id: 'tax-4', name: 'CGST 9%', rate: 9, type: 'cgst', enabled: true },
    { id: 'tax-5', name: 'SGST 9%', rate: 9, type: 'sgst', enabled: true },
    { id: 'tax-6', name: 'IGST 18%', rate: 18, type: 'igst', enabled: true },
    { id: 'tax-7', name: 'Nil Rated', rate: 0, type: 'custom', enabled: true },
  ],
  users: [
    { id: 'u-1', name: 'Athi Krishnan', email: 'athi@bizflow.local', phone: '98425 50000', role: 'Owner', status: 'active', permissions: ['all'] },
    { id: 'u-2', name: 'Priya Raman', email: 'priya@bizflow.local', phone: '94435 60001', role: 'Accountant', status: 'active', permissions: ['reports', 'expenses', 'purchases'] },
    { id: 'u-3', name: 'Rajesh Kumar', email: 'rajesh@bizflow.local', phone: '99940 70002', role: 'Cashier', status: 'active', permissions: ['billing', 'customers', 'products'] },
    { id: 'u-4', name: 'Karthik Selvam', email: 'karthik@bizflow.local', phone: '96550 80003', role: 'Manager', status: 'active', permissions: ['billing', 'inventory', 'purchases', 'products'] },
    { id: 'u-5', name: 'Deepa N', email: 'deepa@bizflow.local', phone: '', role: 'Staff', status: 'inactive', permissions: ['billing'] },
  ],
  printers: [
    { id: 'pr-1', name: 'HP LaserJet A4', type: 'A4 Printer', isDefault: true, connected: true },
    { id: 'pr-2', name: 'Epson TM-T82', type: 'Thermal Printer', isDefault: false, connected: true },
    { id: 'pr-3', name: 'Star Bluetooth Printer', type: 'Bluetooth Printer', isDefault: false, connected: false },
    { id: 'pr-4', name: 'Zebra GK420t', type: 'Barcode Printer', isDefault: false, connected: false },
  ],
  onlineStore: {
    storeName: 'Sri Lakshmi Crackers Store',
    tagline: 'Best fireworks at wholesale rates, delivered across Tamil Nadu.',
    contact: '04562 223344',
    email: 'srilakshmicrackers@gmail.com',
    address: 'No. 12, GST Main Road, Sivakasi, Tamil Nadu - 626123',
    theme: 'blue',
    status: 'online',
    productsPublished: ['p-001', 'p-002', 'p-003', 'p-005', 'p-007', 'p-009', 'p-011', 'p-013', 'p-015'],
  },
}

export * from './products'
export * from './customers'
export * from './suppliers'
export * from './invoices'
export * from './quotations'
export * from './purchases'
export * from './expenses'
