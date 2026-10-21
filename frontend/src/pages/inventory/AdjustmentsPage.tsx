import { useMemo, useState } from 'react'
import { ArrowLeftRight, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable, type Column } from '@/components/common/DataTable'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/EmptyState'
import { useProductStore } from '@/stores/useProductStore'
import { toast } from '@/stores/useToastStore'
import type { StockAdjustment } from '@/types'
import { formatDate, todayISO } from '@/lib/format'
import { uid } from '@/lib/utils'

export function AdjustmentsPage() {
  const products = useProductStore((s) => s.products)
  const adjustStock = useProductStore((s) => s.adjustStock)
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [productId, setProductId] = useState('')
  const [type, setType] = useState<'in' | 'out'>('in')
  const [qty, setQty] = useState('1')
  const [reason, setReason] = useState('Counting correction')
  const [notes, setNotes] = useState('')

  const selectedProduct = products.find((p) => p.id === productId)

  const submit = () => {
    const product = selectedProduct
    if (!product) {
      toast.warning('Select product', 'Choose the product to adjust.')
      return
    }
    const value = Number(qty) || 0
    if (value <= 0) {
      toast.warning('Invalid quantity', 'Enter a quantity greater than zero.')
      return
    }
    adjustStock(productId, type === 'in' ? value : -value)
    const record: StockAdjustment = {
      id: uid('adj'),
      productId: product.id,
      productName: product.name,
      type,
      qty: value,
      reason,
      notes: notes || undefined,
      date: todayISO(),
    }
    setAdjustments((prev) => [record, ...prev])
    toast.success('Stock adjusted', `${product.name} ${type === 'in' ? 'increased' : 'decreased'} by ${value}.`)
    setProductId('')
    setQty('1')
    setNotes('')
    setOpen(false)
  }

  const sorted = useMemo(() => adjustments, [adjustments])

  return (
    <div>
      <PageHeader
        title="Stock Adjustments"
        description={`${adjustments.length} adjustments recorded`}
        icon={<ArrowLeftRight className="h-5 w-5" />}
      >
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New Adjustment
        </Button>
      </PageHeader>

      <div className="p-4">
        {sorted.length === 0 ? (
          <EmptyState
            title="No adjustments yet"
            description="Record stock corrections for damaged, expired or found goods."
            action={{ label: 'New Adjustment', onClick: () => setOpen(true) }}
          />
        ) : (
          <DataTable columns={adjustmentCols({ onDelete: (a) => setDeleteId(a.id) })} data={sorted} keyField={(a) => a.id} />
        )}
      </div>

      <Modal open={open} onOpenChange={setOpen} title="New Stock Adjustment">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · {p.currentStock} in stock
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct && (
              <p className="text-xs text-muted-foreground">
                Current stock: {selectedProduct.currentStock} {selectedProduct.unit}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Adjustment Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'in' | 'out')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stock In</SelectItem>
                  <SelectItem value="out">Stock Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Quantity</Label>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Counting correction', 'Damaged', 'Expired', 'Breakage', 'Found', 'Sample', 'Other'].map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="success" onClick={submit}>
              <Plus className="h-4 w-4" /> Save Adjustment
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete adjustment?"
        description="The adjustment log entry will be removed."
        confirmLabel="Delete"
        onConfirm={() => deleteId && setAdjustments((prev) => prev.filter((a) => a.id !== deleteId))}
      />
    </div>
  )
}

function adjustmentCols(ctx: { onDelete: (a: StockAdjustment) => void }): Column<StockAdjustment>[] {
  return [
    { key: 'date', header: 'Date', render: (a) => <span className="text-muted-foreground">{formatDate(a.date)}</span> },
    { key: 'product', header: 'Product', render: (a) => <span className="font-medium">{a.productName}</span> },
    { key: 'type', header: 'Type', render: (a) => <Badge variant={a.type === 'in' ? 'success' : 'destructive'}>{a.type === 'in' ? 'In' : 'Out'}</Badge> },
    { key: 'qty', header: 'Qty', className: 'text-right', render: (a) => <span className="font-semibold tabular">{a.qty}</span> },
    { key: 'reason', header: 'Reason', render: (a) => <span className="text-xs text-muted-foreground">{a.reason}</span> },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (a) => (
        <button onClick={() => ctx.onDelete(a)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ]
}
