import { lazy, Suspense, type ComponentType } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Toaster } from '@/components/common/Toaster'
import { PageNotFound } from '@/components/common/PageNotFound'
import { LoadingState } from '@/components/common/LoadingState'

function lazyPage<K extends string>(loader: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(async () => ({ default: (await loader())[name] }))
}

const DashboardPage = lazyPage(() => import('@/pages/dashboard/DashboardPage'), 'DashboardPage')
const BillingPage = lazyPage(() => import('@/pages/billing/BillingPage'), 'BillingPage')

const InvoicesPage = lazyPage(() => import('@/pages/sales/InvoicesPage'), 'InvoicesPage')
const InvoiceDetailPage = lazyPage(() => import('@/pages/sales/InvoiceDetailPage'), 'InvoiceDetailPage')
const QuotationsPage = lazyPage(() => import('@/pages/sales/QuotationsPage'), 'QuotationsPage')
const ReturnsPage = lazyPage(() => import('@/pages/sales/ReturnsPage'), 'ReturnsPage')

const PurchasesPage = lazyPage(() => import('@/pages/purchases/PurchasesPage'), 'PurchasesPage')
const PurchaseBillsPage = lazyPage(() => import('@/pages/purchases/PurchaseBillsPage'), 'PurchaseBillsPage')
const PurchaseDetailPage = lazyPage(() => import('@/pages/purchases/PurchaseDetailPage'), 'PurchaseDetailPage')
const PurchaseFormPage = lazyPage(() => import('@/pages/purchases/PurchaseFormPage'), 'PurchaseFormPage')
const PurchaseReturnsPage = lazyPage(() => import('@/pages/purchases/PurchaseReturnsPage'), 'PurchaseReturnsPage')

const ProductsPage = lazyPage(() => import('@/pages/products/ProductsPage'), 'ProductsPage')
const CategoriesPage = lazyPage(() => import('@/pages/products/CategoriesPage'), 'CategoriesPage')

const InventoryPage = lazyPage(() => import('@/pages/inventory/InventoryPage'), 'InventoryPage')
const StockPage = lazyPage(() => import('@/pages/inventory/StockPage'), 'StockPage')
const AdjustmentsPage = lazyPage(() => import('@/pages/inventory/AdjustmentsPage'), 'AdjustmentsPage')
const GodownsPage = lazyPage(() => import('@/pages/inventory/GodownsPage'), 'GodownsPage')

const CustomerListPage = lazyPage(() => import('@/pages/customers/CustomerListPage'), 'CustomerListPage')
const CustomerDetailPage = lazyPage(() => import('@/pages/customers/CustomerDetailPage'), 'CustomerDetailPage')
const CustomerLedgerPage = lazyPage(() => import('@/pages/customers/CustomerLedgerPage'), 'CustomerLedgerPage')

const SupplierListPage = lazyPage(() => import('@/pages/suppliers/SupplierListPage'), 'SupplierListPage')
const SupplierDetailPage = lazyPage(() => import('@/pages/suppliers/SupplierDetailPage'), 'SupplierDetailPage')
const SupplierLedgerPage = lazyPage(() => import('@/pages/suppliers/SupplierLedgerPage'), 'SupplierLedgerPage')

const ExpensesPage = lazyPage(() => import('@/pages/expenses/ExpensesPage'), 'ExpensesPage')

const ReportsPage = lazyPage(() => import('@/pages/reports/ReportsPage'), 'ReportsPage')
const SalesReportPage = lazyPage(() => import('@/pages/reports/SalesReportPage'), 'SalesReportPage')
const PurchaseReportPage = lazyPage(() => import('@/pages/reports/PurchaseReportPage'), 'PurchaseReportPage')
const ProfitLossPage = lazyPage(() => import('@/pages/reports/ProfitLossPage'), 'ProfitLossPage')
const InventoryReportPage = lazyPage(() => import('@/pages/reports/InventoryReportPage'), 'InventoryReportPage')
const CustomerReportPage = lazyPage(() => import('@/pages/reports/CustomerReportPage'), 'CustomerReportPage')
const GstReportPage = lazyPage(() => import('@/pages/reports/GstReportPage'), 'GstReportPage')

const OnlineStorePage = lazyPage(() => import('@/pages/onlineStore/OnlineStorePage'), 'OnlineStorePage')
const BusinessSettingsPage = lazyPage(() => import('@/pages/settings/BusinessSettingsPage'), 'BusinessSettingsPage')
const InvoiceSettingsPage = lazyPage(() => import('@/pages/settings/InvoiceSettingsPage'), 'InvoiceSettingsPage')
const UsersSettingsPage = lazyPage(() => import('@/pages/settings/UsersSettingsPage'), 'UsersSettingsPage')
const PrinterSettingsPage = lazyPage(() => import('@/pages/settings/PrinterSettingsPage'), 'PrinterSettingsPage')
const TaxesSettingsPage = lazyPage(() => import('@/pages/settings/TaxesSettingsPage'), 'TaxesSettingsPage')

function PageFallback() {
  return <LoadingState label="Loading..." className="min-h-[60vh]" />
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Suspense fallback={<PageFallback />}><DashboardPage /></Suspense>} />
          <Route path="/billing" element={<Suspense fallback={<PageFallback />}><BillingPage /></Suspense>} />

          <Route path="/sales/invoices" element={<Suspense fallback={<PageFallback />}><InvoicesPage /></Suspense>} />
          <Route path="/sales/invoices/:id" element={<Suspense fallback={<PageFallback />}><InvoiceDetailPage /></Suspense>} />
          <Route path="/sales/quotations" element={<Suspense fallback={<PageFallback />}><QuotationsPage /></Suspense>} />
          <Route path="/sales/returns" element={<Suspense fallback={<PageFallback />}><ReturnsPage /></Suspense>} />

          <Route path="/purchases" element={<Suspense fallback={<PageFallback />}><PurchasesPage /></Suspense>} />
          <Route path="/purchases/bills" element={<Suspense fallback={<PageFallback />}><PurchaseBillsPage /></Suspense>} />
          <Route path="/purchases/bills/:id" element={<Suspense fallback={<PageFallback />}><PurchaseDetailPage /></Suspense>} />
          <Route path="/purchases/new" element={<Suspense fallback={<PageFallback />}><PurchaseFormPage /></Suspense>} />
          <Route path="/purchases/returns" element={<Suspense fallback={<PageFallback />}><PurchaseReturnsPage /></Suspense>} />

          <Route path="/products/list" element={<Suspense fallback={<PageFallback />}><ProductsPage /></Suspense>} />
          <Route path="/products/categories" element={<Suspense fallback={<PageFallback />}><CategoriesPage /></Suspense>} />

          <Route path="/inventory" element={<Suspense fallback={<PageFallback />}><InventoryPage /></Suspense>} />
          <Route path="/inventory/stock" element={<Suspense fallback={<PageFallback />}><StockPage /></Suspense>} />
          <Route path="/inventory/adjustments" element={<Suspense fallback={<PageFallback />}><AdjustmentsPage /></Suspense>} />
          <Route path="/inventory/godowns" element={<Suspense fallback={<PageFallback />}><GodownsPage /></Suspense>} />

          <Route path="/customers/list" element={<Suspense fallback={<PageFallback />}><CustomerListPage /></Suspense>} />
          <Route path="/customers/:id" element={<Suspense fallback={<PageFallback />}><CustomerDetailPage /></Suspense>} />
          <Route path="/customers/ledger" element={<Suspense fallback={<PageFallback />}><CustomerLedgerPage /></Suspense>} />

          <Route path="/suppliers/list" element={<Suspense fallback={<PageFallback />}><SupplierListPage /></Suspense>} />
          <Route path="/suppliers/:id" element={<Suspense fallback={<PageFallback />}><SupplierDetailPage /></Suspense>} />
          <Route path="/suppliers/ledger" element={<Suspense fallback={<PageFallback />}><SupplierLedgerPage /></Suspense>} />

          <Route path="/expenses" element={<Suspense fallback={<PageFallback />}><ExpensesPage /></Suspense>} />

          <Route path="/reports" element={<Suspense fallback={<PageFallback />}><ReportsPage /></Suspense>} />
          <Route path="/reports/sales" element={<Suspense fallback={<PageFallback />}><SalesReportPage /></Suspense>} />
          <Route path="/reports/purchases" element={<Suspense fallback={<PageFallback />}><PurchaseReportPage /></Suspense>} />
          <Route path="/reports/profit" element={<Suspense fallback={<PageFallback />}><ProfitLossPage /></Suspense>} />
          <Route path="/reports/inventory" element={<Suspense fallback={<PageFallback />}><InventoryReportPage /></Suspense>} />
          <Route path="/reports/customers" element={<Suspense fallback={<PageFallback />}><CustomerReportPage /></Suspense>} />
          <Route path="/reports/gst" element={<Suspense fallback={<PageFallback />}><GstReportPage /></Suspense>} />

          <Route path="/online-store" element={<Suspense fallback={<PageFallback />}><OnlineStorePage /></Suspense>} />

          <Route path="/settings/business" element={<Suspense fallback={<PageFallback />}><BusinessSettingsPage /></Suspense>} />
          <Route path="/settings/invoice" element={<Suspense fallback={<PageFallback />}><InvoiceSettingsPage /></Suspense>} />
          <Route path="/settings/users" element={<Suspense fallback={<PageFallback />}><UsersSettingsPage /></Suspense>} />
          <Route path="/settings/printer" element={<Suspense fallback={<PageFallback />}><PrinterSettingsPage /></Suspense>} />
          <Route path="/settings/taxes" element={<Suspense fallback={<PageFallback />}><TaxesSettingsPage /></Suspense>} />

          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </HashRouter>
  )
}
