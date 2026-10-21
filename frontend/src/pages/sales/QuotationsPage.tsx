import { useMemo, useState } from 'react'
import { ClipboardList, Plus, Eye, Printer, Copy, Trash2, MoreHorizontal, Download } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { FilterBar } from '@/components/common/FilterBar'
import { DataTable, type Column } from '@/components/common/DataTable'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DocumentStatusBadge } from '@/components/common/StatusBadge'
import { QuotationForm } from '@/components/billing/QuotationForm'
import { Modal } from '@/components/common/Modal'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import type { Quotation } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { downloadCsv } from '@/lib/desktop/fs'
import { toast } from '@/stores/useToastStore'

type TabFilter = 'all' | 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'

const tabs: { id: TabFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'expired', label: 'Expired' },
  { id: 'converted', label: 'Converted' },
]

export function QuotationsPage() {
  const quotations = useInvoiceStore((s) => s.quotations)
  const deleteQuotation = useInvoiceStore((s) => s.deleteQuotation)
  const updateQuotationStatus = useInvoiceStore((s) => s.updateQuotationStatus)
  const [tab, setTab] = useState<TabFilter>('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState<Quotation | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return quotations.filter((qu) => {
      if (tab !== 'all' && qu.status !== tab) return false
      if (q && !qu.quotationNumber.toLowerCase().includes(q) && !qu.customerName.toLowerCase().includes(q)) return false
      return true
    })
  }, [quotations, tab, search])

  const exportCsv = async () => {
    await downloadCsv('quotations.csv', [
      ['Quotation', 'Customer', 'Date', 'Valid Until', 'Amount', 'Status'],
      ...filtered.map((q) => [q.quotationNumber, q.customerName, q.date, q.validUntil, String(q.grandTotal), q.status]),
    ])
    toast.success('Quotations exported', 'quotations.csv downloaded.')
  }

  return (
    <div>
      <PageHeader
        title="Quotations"
        description={`${quotations.length} quotations`}
        icon={<ClipboardList className="h-5 w-5" />}
      >
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> New Quotation
        </Button>
      </PageHeader>

      <FilterBar>
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabFilter)}>
          <TabsList>
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quotations..."
          containerClassName="ml-auto w-64"
        />
      </FilterBar>

      <div className="p-4">
        <DataTable
          columns={quotationColumns({
            onView: setView,
            onDelete: (q) => setDeleteId(q.id),
            onConvert: (q) => updateQuotationStatus(q.id, 'converted'),
            onPrint: (q) => toast.info('Print', `${q.quotationNumber} sent to printer.`),
          })}
          data={filtered}
          keyField={(q) => q.id}
          onRowClick={(q) => setView(q)}
        />
      </div>

      <QuotationForm open={formOpen} onOpenChange={setFormOpen} />

      <Modal open={!!view} onOpenChange={(o) => !o && setView(null)} title={view ? `${view.quotationNumber} · ${view.customerName}` : 'Quotation'}>
        {view && <QuotationDetail quotation={view} />}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete quotation?"
        description="This quotation will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteQuotation(deleteId)}
      />
    </div>
  )
}

function quotationColumns(ctx: {
  onView: (q: Quotation) => void
  onDelete: (q: Quotation) => void
  onConvert: (q: Quotation) => void
  onPrint: (q: Quotation) => void
}): Column<Quotation>[] {
  return [
    {
      key: 'quotation',
      header: 'Quotation #',
      render: (q) => (
        <div>
          <p className="font-medium">{q.quotationNumber}</p>
          <p className="text-[11px] text-muted-foreground">{formatDate(q.date)}</p>
        </div>
      ),
    },
    { key: 'customer', header: 'Customer', render: (q) => <span>{q.customerName}</span> },
    {
      key: 'valid',
      header: 'Valid Until',
      render: (q) => (
        <span className={isExpired(q) ? 'text-destructive' : 'text-muted-foreground'}>
          {formatDate(q.validUntil)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (q) => <span className="font-semibold tabular">{formatCurrency(q.grandTotal)}</span>,
    },
    { key: 'status', header: 'Status', render: (q) => <DocumentStatusBadge status={q.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'w-14',
      render: (q) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-md p-1.5 hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => ctx.onView(q)}>
              <Eye className="h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => ctx.onPrint(q)}>
              <Printer className="h-4 w-4" /> Print
            </DropdownMenuItem>
            {q.status !== 'converted' && (
              <DropdownMenuItem onClick={() => ctx.onConvert(q)}>
                <Copy className="h-4 w-4" /> Convert to Invoice
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => ctx.onDelete(q)} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}

function isExpired(q: Quotation) {
  return q.status === 'sent' && q.validUntil && q.validUntil < new Date().toISOString().slice(0, 10)
}

export function QuotationDetail({ quotation }: { quotation: Quotation }) {
  return (
    <div className="space-y-4">
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
          {quotation.items.map((it) => (
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
      <div className="ml-auto w-64 space-y-1 text-sm">
        <Row label="Subtotal" value={formatCurrency(quotation.subtotal)} />
        <Row label="GST" value={formatCurrency(quotation.tax)} />
        <div className="flex justify-between border-t pt-1 font-bold">
          <span>Total</span>
          <span className="tabular">{formatCurrency(quotation.grandTotal)}</span>
        </div>
      </div>
    </div>
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
