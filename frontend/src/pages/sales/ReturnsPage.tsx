import { useMemo, useState } from 'react'
import { Undo2, Plus, FileText, RefreshCcw } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { FilterBar } from '@/components/common/FilterBar'
import { DataTable, type Column } from '@/components/common/DataTable'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/common/Modal'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import { useProductStore } from '@/stores/useProductStore'
import { Badge } from '@/components/ui/badge'
import type { SalesReturn } from '@/types'
import { formatCurrency, formatDate, todayISO } from '@/lib/format'
import { toast } from '@/stores/useToastStore'
import { EmptyState } from '@/components/common/EmptyState'

export function ReturnsPage() {
  const returns = useInvoiceStore((s) => s.returns)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return returns
    return returns.filter(
      (r) => r.returnNumber.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q),
    )
  }, [returns, search])

  return (
    <div>
      <PageHeader
        title="Sales Returns"
        description={`${returns.length} return notes`}
        icon={<Undo2 className="h-5 w-5" />}
      >
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New Return
        </Button>
      </PageHeader>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search returns..."
          containerClassName="ml-auto w-64"
        />
      </FilterBar>

      <div className="p-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="No sales returns"
            description="Process returns against an invoice to restock items and issue a credit."
            action={{ label: 'New Return', onClick: () => setOpen(true) }}
          />
        ) : (
          <DataTable
            columns={returnColumns()}
            data={filtered}
            keyField={(r) => r.id}
          />
        )}
      </div>

      <ReturnForm open={open} onOpenChange={setOpen} />
    </div>
  )
}

function returnColumns(): Column<SalesReturn>[] {
  return [
    { key: 'number', header: 'Return #', render: (r) => <span className="font-medium">{r.returnNumber}</span> },
    { key: 'invoice', header: 'Invoice', render: (r) => <span className="text-muted-foreground">{r.invoiceNumber}</span> },
    { key: 'customer', header: 'Customer', render: (r) => <span>{r.customerName}</span> },
    { key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground">{formatDate(r.date)}</span> },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (r) => <span className="font-semibold tabular text-destructive">−{formatCurrency(r.total)}</span>,
    },
    {
      key: 'method',
      header: 'Refund',
      render: (r) => <Badge variant="secondary" className="capitalize">{r.refundMethod}</Badge>,
    },
    { key: 'reason', header: 'Reason', render: (r) => <span className="text-xs text-muted-foreground">{r.reason}</span> },
  ]
}

function ReturnForm({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const invoices = useInvoiceStore((s) => s.invoices)
  const createReturn = useInvoiceStore((s) => s.createReturn)
  const adjustStock = useProductStore((s) => s.adjustStock)

  const [invoiceId, setInvoiceId] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [reason, setReason] = useState('Customer return')
  const [method, setMethod] = useState<'refund' | 'credit' | 'credit-note'>('credit')

  const invoice = invoices.find((i) => i.id === invoiceId)

  const submit = () => {
    if (!invoice) {
      toast.warning('Select invoice', 'Choose the invoice for this return.')
      return
    }
    const items = invoice.items
      .map((it) => ({ it, qty: quantities[it.id] ?? 0 }))
      .filter((x) => x.qty > 0)
    if (items.length === 0) {
      toast.warning('No quantities', 'Set a return quantity for at least one item.')
      return
    }
    createReturn({
      returnNumber: `RTN-${Date.now().toString().slice(-6)}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      date: todayISO(),
      items: items.map(({ it, qty }) => ({
        id: it.id,
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        qty,
        price: it.price,
        gstRate: it.gstRate,
        total: it.price * qty,
      })),
      total: items.reduce((s, { it, qty }) => s + it.price * qty, 0),
      refundMethod: method,
      reason,
    })
    items.forEach(({ it, qty }) => adjustStock(it.productId, qty))
    toast.success('Return processed', 'Stock restocked and credit recorded.')
    setInvoiceId('')
    setQuantities({})
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New Sales Return" className="max-w-xl">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>Invoice</Label>
          <Select value={invoiceId} onValueChange={setInvoiceId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an invoice" />
            </SelectTrigger>
            <SelectContent>
              {invoices
                .filter((i) => i.status === 'completed')
                .map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.invoiceNumber} · {i.customerName} · {formatCurrency(i.grandTotal)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {invoice && (
          <>
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2">Product</th>
                    <th className="w-16 px-2 py-2 text-center">Sold</th>
                    <th className="w-20 px-2 py-2 text-right">Return Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((it) => {
                    const qty = quantities[it.id] ?? 0
                    return (
                      <tr key={it.id} className="border-b">
                        <td className="px-3 py-2">
                          <p className="font-medium">{it.productName}</p>
                          <p className="text-[11px] text-muted-foreground">{it.sku}</p>
                        </td>
                        <td className="px-2 py-2 text-center tabular">{it.qty}</td>
                        <td className="px-2 py-2 text-right">
                          <Input
                            type="number"
                            min={0}
                            max={it.qty}
                            value={qty || ''}
                            onChange={(e) => {
                              const v = Math.min(it.qty, Math.max(0, Number(e.target.value) || 0))
                              setQuantities((p) => ({ ...p, [it.id]: v }))
                            }}
                            className="ml-auto h-8 w-16 text-right tabular"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Customer return', 'Damaged goods', 'Wrong item', 'Defective product', 'Exchange'].map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Refund Method</Label>
                <Select value={method} onValueChange={(v) => setMethod(v as typeof method)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit Balance</SelectItem>
                    <SelectItem value="refund">Cash / Bank Refund</SelectItem>
                    <SelectItem value="credit-note">Credit Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" /> Return total
              </span>
              <span className="text-lg font-bold tabular">
                {formatCurrency(invoice.items.reduce((s, it) => s + it.price * (quantities[it.id] ?? 0), 0))}
              </span>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="success" onClick={submit}>
            <RefreshCcw className="h-4 w-4" /> Process Return
          </Button>
        </div>
      </div>
    </Modal>
  )
}
