import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReceiptText, Plus, Eye, Copy, Printer, Share2, XCircle, MoreHorizontal, Download } from 'lucide-react'
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
import { PaymentStatusBadge, DocumentStatusBadge } from '@/components/common/StatusBadge'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import type { Invoice } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { downloadCsv } from '@/lib/desktop/fs'
import { toast } from '@/stores/useToastStore'

type TabFilter = 'all' | 'paid' | 'partial' | 'pending' | 'cancelled'

const tabs: { id: TabFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'partial', label: 'Partial' },
  { id: 'pending', label: 'Pending' },
  { id: 'cancelled', label: 'Cancelled' },
]

export function InvoicesPage() {
  const navigate = useNavigate()
  const invoices = useInvoiceStore((s) => s.invoices)
  const duplicateInvoice = useInvoiceStore((s) => s.duplicateInvoice)
  const cancelInvoice = useInvoiceStore((s) => s.cancelInvoice)
  const [tab, setTab] = useState<TabFilter>('all')
  const [search, setSearch] = useState('')
  const [cancelId, setCancelId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return invoices.filter((i) => {
      if (tab !== 'all' && i.paymentStatus !== tab && !(tab === 'cancelled' && i.status === 'cancelled')) return false
      if (q && !i.invoiceNumber.toLowerCase().includes(q) && !i.customerName.toLowerCase().includes(q)) return false
      return true
    })
  }, [invoices, tab, search])

  const exportCsv = async () => {
    await downloadCsv('invoices.csv', [
      ['Invoice', 'Customer', 'Date', 'Amount', 'Paid', 'Status'],
      ...filtered.map((i) => [i.invoiceNumber, i.customerName, i.date, String(i.grandTotal), String(i.amountPaid), i.paymentStatus]),
    ])
    toast.success('Invoices exported', 'invoices.csv downloaded.')
  }

  return (
    <div>
      <PageHeader
        title="Invoices"
        description={`${invoices.filter((i) => i.status !== 'cancelled').length} invoices · ${formatCurrency(invoices.filter((i) => i.status !== 'cancelled').reduce((s, i) => s + i.grandTotal, 0))} total`}
        icon={<ReceiptText className="h-5 w-5" />}
      >
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button size="sm" onClick={() => navigate('/billing')}>
          <Plus className="h-4 w-4" /> New Sale
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
          placeholder="Search invoice # or customer..."
          containerClassName="ml-auto w-64"
        />
      </FilterBar>

      <div className="p-4">
        <DataTable
          columns={invoiceColumns({
            onView: (i) => navigate(`/sales/invoices/${i.id}`),
            onDuplicate: (i) => duplicateInvoice(i.id),
            onCancel: (i) => setCancelId(i.id),
            onPrint: (i) => navigate(`/sales/invoices/${i.id}`),
          })}
          data={filtered}
          keyField={(i) => i.id}
          onRowClick={(i) => navigate(`/sales/invoices/${i.id}`)}
        />
      </div>

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={(o) => !o && setCancelId(null)}
        title="Cancel invoice?"
        description="The invoice will be marked cancelled and removed from sales totals."
        confirmLabel="Cancel Invoice"
        onConfirm={() => cancelId && cancelInvoice(cancelId)}
      />
    </div>
  )
}

function invoiceColumns(ctx: {
  onView: (i: Invoice) => void
  onDuplicate: (i: Invoice) => void
  onCancel: (i: Invoice) => void
  onPrint: (i: Invoice) => void
}): Column<Invoice>[] {
  return [
    {
      key: 'invoice',
      header: 'Invoice #',
      render: (i) => (
        <div>
          <p className="font-medium">{i.invoiceNumber}</p>
          <p className="text-[11px] text-muted-foreground">{formatDate(i.date)}</p>
        </div>
      ),
    },
    { key: 'customer', header: 'Customer', render: (i) => <span>{i.customerName}</span> },
    { key: 'items', header: 'Items', className: 'text-center', render: (i) => <span className="tabular">{i.items.length}</span> },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (i) => (
        <div className="text-right">
          <p className="font-semibold tabular">{formatCurrency(i.grandTotal)}</p>
          <p className="text-[11px] text-muted-foreground">Paid {formatCurrency(i.amountPaid)}</p>
        </div>
      ),
    },
    { key: 'payment', header: 'Payment', render: (i) => <PaymentStatusBadge status={i.paymentStatus} /> },
    { key: 'status', header: 'Status', render: (i) => <DocumentStatusBadge status={i.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'w-14',
      render: (i) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-md p-1.5 hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => ctx.onView(i)}>
              <Eye className="h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => ctx.onDuplicate(i)}>
              <Copy className="h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => ctx.onPrint(i)}>
              <Printer className="h-4 w-4" /> Print
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('Share', 'Share link copied (demo).')}>
              <Share2 className="h-4 w-4" /> Share
            </DropdownMenuItem>
            {i.status !== 'cancelled' && (
              <DropdownMenuItem onClick={() => ctx.onCancel(i)} className="text-destructive focus:text-destructive">
                <XCircle className="h-4 w-4" /> Cancel
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
