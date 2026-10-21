import { useState } from 'react'
import { Undo2, Plus, RefreshCcw } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable, type Column } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/EmptyState'
import { usePurchaseStore } from '@/stores/usePurchaseStore'
import { useProductStore } from '@/stores/useProductStore'
import { toast } from '@/stores/useToastStore'
import type { PurchaseReturn } from '@/types'
import { formatCurrency, formatDate, todayISO } from '@/lib/format'
import { uid } from '@/lib/utils'

export function PurchaseReturnsPage() {
  const purchases = usePurchaseStore((s) => s.purchases)
  const adjustStock = useProductStore((s) => s.adjustStock)
  const [returns, setReturns] = useState<PurchaseReturn[]>([])
  const [open, setOpen] = useState(false)
  const [purchaseId, setPurchaseId] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [reason, setReason] = useState('Wrong goods')
  const [method, setMethod] = useState<'refund' | 'credit' | 'credit-note'>('credit')

  const purchase = purchases.find((p) => p.id === purchaseId)

  const submit = () => {
    if (!purchase) {
      toast.warning('Select bill', 'Choose the purchase bill to return.')
      return
    }
    const items = purchase.items
      .map((it) => ({ it, qty: quantities[it.id] ?? 0 }))
      .filter((x) => x.qty > 0)
    if (items.length === 0) {
      toast.warning('No quantities', 'Set a return quantity for at least one item.')
      return
    }
    const record: PurchaseReturn = {
      id: uid('pret'),
      returnNumber: `PRTN-${Date.now().toString().slice(-6)}`,
      purchaseId: purchase.id,
      billNumber: purchase.billNumber,
      supplierId: purchase.supplierId,
      supplierName: purchase.supplierName,
      date: todayISO(),
      createdAt: todayISO(),
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
    }
    setReturns((prev) => [record, ...prev])
    items.forEach(({ it, qty }) => adjustStock(it.productId, -qty))
    toast.success('Purchase return processed', `${record.returnNumber} created.`)
    setPurchaseId('')
    setQuantities({})
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Purchase Returns"
        description={`${returns.length} returns to suppliers`}
        icon={<Undo2 className="h-5 w-5" />}
      >
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New Return
        </Button>
      </PageHeader>

      <div className="p-4">
        {returns.length === 0 ? (
          <EmptyState
            title="No purchase returns"
            description="Record goods returned to suppliers for credit or refund."
            action={{ label: 'New Return', onClick: () => setOpen(true) }}
          />
        ) : (
          <DataTable columns={columns} data={returns} keyField={(r) => r.id} />
        )}
      </div>

      <Modal open={open} onOpenChange={setOpen} title="New Purchase Return" className="max-w-xl">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Purchase Bill</Label>
            <Select value={purchaseId} onValueChange={setPurchaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select bill" />
              </SelectTrigger>
              <SelectContent>
                {purchases
                  .filter((p) => p.status !== 'cancelled')
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.billNumber} · {p.supplierName} · {formatCurrency(p.grandTotal)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {purchase && (
            <>
              <div className="rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2">Product</th>
                      <th className="w-16 px-2 py-2 text-center">Bought</th>
                      <th className="w-20 px-2 py-2 text-right">Return Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchase.items.map((it) => {
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
                      {['Wrong goods', 'Damaged on delivery', 'Excess quantity', 'Quality issue', 'Other'].map((r) => (
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
                      <SelectItem value="credit">Supplier Credit</SelectItem>
                      <SelectItem value="refund">Cash / Bank Refund</SelectItem>
                      <SelectItem value="credit-note">Debit Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                <span className="text-sm text-muted-foreground">Return total</span>
                <span className="text-lg font-bold tabular">
                  {formatCurrency(purchase.items.reduce((s, it) => s + it.price * (quantities[it.id] ?? 0), 0))}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="success" onClick={submit}>
              <RefreshCcw className="h-4 w-4" /> Process Return
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

const columns: Column<PurchaseReturn>[] = [
  { key: 'number', header: 'Return #', render: (r) => <span className="font-medium">{r.returnNumber}</span> },
  { key: 'bill', header: 'Bill', render: (r) => <span className="text-muted-foreground">{r.billNumber}</span> },
  { key: 'supplier', header: 'Supplier', render: (r) => <span>{r.supplierName}</span> },
  { key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground">{formatDate(r.date)}</span> },
  {
    key: 'amount',
    header: 'Amount',
    className: 'text-right',
    render: (r) => <span className="font-semibold tabular text-success">{formatCurrency(r.total)}</span>,
  },
  { key: 'method', header: 'Method', render: (r) => <Badge variant="secondary" className="capitalize">{r.refundMethod}</Badge> },
  { key: 'reason', header: 'Reason', render: (r) => <span className="text-xs text-muted-foreground">{r.reason}</span> },
]
