import { useMemo, useState } from 'react'
import { CalendarDays, Send } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CustomerSelector } from '@/components/billing/CustomerSelector'
import { ProductSearch } from '@/components/billing/ProductSearch'
import { InvoiceItemsTable } from '@/components/billing/InvoiceItemsTable'
import { useProductStore } from '@/stores/useProductStore'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import { toast } from '@/stores/useToastStore'
import type { InvoiceItem, Product } from '@/types'
import { computeLine, computeTotals } from '@/lib/billing'
import { formatCurrency } from '@/lib/format'

interface QuotationFormProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function QuotationForm({ open, onOpenChange }: QuotationFormProps) {
  const products = useProductStore((s) => s.products)
  const createQuotation = useInvoiceStore((s) => s.createQuotation)

  const [customerId, setCustomerId] = useState('c-001')
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [additionalDiscount, setAdditionalDiscount] = useState(0)
  const [validDays, setValidDays] = useState(7)

  const totals = useMemo(() => computeTotals(items, additionalDiscount), [items, additionalDiscount])

  const addProduct = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...computeLine(product, i.qty + 1, i.price, i.discount), id: i.id }
            : i,
        )
      }
      return [...prev, computeLine(product, 1, product.sellingPrice, 0)]
    })
  }

  const updateItem = (id: string, patch: Partial<InvoiceItem>) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const merged = { ...i, ...patch }
        const product = products.find((p) => p.id === i.productId)
        if (!product) return merged
        return computeLine(product, merged.qty, merged.price, merged.discount)
      }),
    )
  }

  const close = () => {
    onOpenChange(false)
    setItems([])
    setAdditionalDiscount(0)
  }

  const submit = () => {
    if (items.length === 0) {
      toast.warning('No items', 'Add at least one product to the quotation.')
      return
    }
    createQuotation(
      {
        customerId,
        items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        grandTotal: totals.grandTotal,
      },
      customerId,
      new Date(Date.now() + validDays * 86400000).toISOString(),
    )
    close()
  }

  return (
    <Modal open={open} onOpenChange={close} title="New Quotation" className="max-w-3xl">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="shrink-0 text-xs font-medium text-muted-foreground">Customer</Label>
            <CustomerSelector value={customerId} onChange={setCustomerId} />
          </div>
          <div className="flex items-center gap-2">
            <Label className="shrink-0 text-xs font-medium text-muted-foreground">
              <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
              Valid for
            </Label>
            <Input
              type="number"
              min={1}
              value={validDays}
              onChange={(e) => setValidDays(Math.max(1, Number(e.target.value) || 1))}
              className="h-9 w-20 text-center tabular"
            />
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </div>

        <ProductSearch onSelect={addProduct} />

        <div className="max-h-64 overflow-auto rounded-lg border">
          <InvoiceItemsTable
            items={items}
            onUpdate={updateItem}
            onRemove={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
            onSelectProduct={() => document.getElementById('billing-search-input')?.focus()}
          />
        </div>

        <div className="ml-auto w-64 space-y-1.5 text-sm">
          <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Discount</span>
            <Input
              type="number"
              min={0}
              value={additionalDiscount}
              onChange={(e) => setAdditionalDiscount(Math.max(0, Number(e.target.value) || 0))}
              className="h-7 w-24 text-right tabular"
            />
          </div>
          <Row label="GST" value={formatCurrency(totals.cgst + totals.sgst + totals.igst)} />
          <div className="flex justify-between border-t pt-1.5 text-base font-bold">
            <span>Total</span>
            <span className="tabular">{formatCurrency(totals.grandTotal)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button variant="success" onClick={submit}>
            <Send className="h-4 w-4" /> Save &amp; Send Quotation
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="tabular">{value}</span>
    </div>
  )
}
