import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FileText, Plus, Printer, Banknote, Download, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { FilterBar } from '@/components/common/FilterBar'
import { DataTable } from '@/components/common/DataTable'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'
import { PaymentStatusBadge, DocumentStatusBadge } from '@/components/common/StatusBadge'
import { usePurchaseStore } from '@/stores/usePurchaseStore'
import type { Purchase } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { downloadCsv } from '@/lib/desktop/fs'
import { toast } from '@/stores/useToastStore'
import { billCols } from './PurchasesPage'

type TabFilter = 'all' | 'paid' | 'partial' | 'pending' | 'cancelled'

export function PurchaseBillsPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const purchases = usePurchaseStore((s) => s.purchases)
  const cancelPurchase = usePurchaseStore((s) => s.cancelPurchase)
  const [tab, setTab] = useState<TabFilter>('all')
  const [search, setSearch] = useState('')
  const [viewId, setViewId] = useState<string | null>(params.get('view'))
  const [cancelId, setCancelId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return purchases
      .filter((p) => {
        if (tab === 'cancelled') return p.status === 'cancelled'
        if (tab !== 'all' && p.paymentStatus !== tab) return false
        if (p.status === 'cancelled') return false
        if (q && !p.billNumber.toLowerCase().includes(q) && !p.supplierName.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [purchases, tab, search])

  const exportCsv = async () => {
    await downloadCsv('purchase-bills.csv', [
      ['Bill', 'Supplier', 'Date', 'Amount', 'Paid', 'Status'],
      ...filtered.map((p) => [p.billNumber, p.supplierName, p.date, String(p.grandTotal), String(p.amountPaid), p.paymentStatus]),
    ])
    toast.success('Bills exported', 'purchase-bills.csv downloaded.')
  }

  return (
    <div>
      <PageHeader
        title="Purchase Bills"
        description={`${purchases.length} bills`}
        icon={<FileText className="h-5 w-5" />}
      >
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button size="sm" onClick={() => navigate('/purchases/new')}>
          <Plus className="h-4 w-4" /> New Purchase Bill
        </Button>
      </PageHeader>

      <FilterBar>
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="partial">Partial</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bill or supplier..."
          containerClassName="ml-auto w-64"
        />
      </FilterBar>

      <div className="p-4">
        <DataTable
          columns={billCols}
          data={filtered}
          keyField={(p) => p.id}
          onRowClick={(p) => setViewId(p.id)}
        />
      </div>

      <PurchaseDetail
        purchase={purchases.find((p) => p.id === viewId) ?? null}
        onClose={() => setViewId(null)}
        onPay={(p) => {
          setViewId(null)
          navigate(`/purchases/bills/${p.id}`)
        }}
        onCancel={(p) => {
          setViewId(null)
          setCancelId(p.id)
        }}
      />

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={(o) => !o && setCancelId(null)}
        title="Cancel purchase bill?"
        description="The bill will be marked as cancelled and excluded from purchase totals."
        confirmLabel="Cancel Bill"
        onConfirm={() => cancelId && cancelPurchase(cancelId)}
      />
    </div>
  )
}

function PurchaseDetail({
  purchase,
  onClose,
  onPay,
  onCancel,
}: {
  purchase: Purchase | null
  onClose: () => void
  onPay: (p: Purchase) => void
  onCancel: (p: Purchase) => void
}) {
  if (!purchase) return null
  const balance = purchase.grandTotal - purchase.amountPaid
  return (
    <Modal open={!!purchase} onOpenChange={(o) => !o && onClose()} title={`${purchase.billNumber} · ${purchase.supplierName}`} className="max-w-2xl">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">{formatDate(purchase.date)}</span>
          <PaymentStatusBadge status={purchase.paymentStatus} />
          <DocumentStatusBadge status={purchase.status} />
          {purchase.supplierInvoiceNumber && (
            <span className="text-muted-foreground">Supplier ref: {purchase.supplierInvoiceNumber}</span>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2">Product</th>
              <th className="w-16 px-2 py-2 text-right">Qty</th>
              <th className="w-24 px-2 py-2 text-right">Rate</th>
              <th className="w-28 px-2 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {purchase.items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="px-2 py-2">
                  <p className="font-medium">{it.productName}</p>
                  <p className="text-[11px] text-muted-foreground">{it.sku}</p>
                </td>
                <td className="px-2 py-2 text-right tabular">{it.qty}</td>
                <td className="px-2 py-2 text-right tabular">{formatCurrency(it.price)}</td>
                <td className="px-2 py-2 text-right font-medium tabular">{formatCurrency(it.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto w-56 space-y-1 text-sm">
          <Row label="Subtotal" value={formatCurrency(purchase.subtotal)} />
          <Row label="Discount" value={`− ${formatCurrency(purchase.discount)}`} />
          <Row label="GST" value={formatCurrency(purchase.cgst + purchase.sgst)} />
          <div className="flex justify-between border-t pt-1 font-bold">
            <span>Total</span>
            <span className="tabular">{formatCurrency(purchase.grandTotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Paid</span>
            <span className="tabular text-success">{formatCurrency(purchase.amountPaid)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Balance</span>
            <span className="tabular text-warning">{formatCurrency(Math.max(0, balance))}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Print', `${purchase.billNumber} sent to printer.`)}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          {purchase.status !== 'cancelled' && (
            <Button variant="destructive" size="sm" onClick={() => onCancel(purchase)}>
              <XCircle className="h-4 w-4" /> Cancel
            </Button>
          )}
          {purchase.status !== 'cancelled' && balance > 0 && (
            <Button size="sm" onClick={() => onPay(purchase)}>
              <Banknote className="h-4 w-4" /> Record Payment
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="tabular text-foreground">{value}</span>
    </div>
  )
}
