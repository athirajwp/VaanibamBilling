import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, ShoppingBag } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/common/EmptyState'
import { ProductSearch } from '@/components/billing/ProductSearch'
import { useSupplierStore } from '@/stores/useSupplierStore'
import { useProductStore } from '@/stores/useProductStore'
import { usePurchaseStore } from '@/stores/usePurchaseStore'
import { toast } from '@/stores/useToastStore'
import type { Product, PurchaseItem } from '@/types'
import { uid } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'

function purchaseLine(product: Product, qty: number, price: number, discount: number): PurchaseItem {
  const gstRate = product.taxType === 'exempt' ? 0 : product.gstRate
  const base = qty * price - discount
  const gstAmount = Math.round(base * (gstRate / 100))
  return {
    id: uid('pli'),
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    qty,
    price,
    purchasePrice: price,
    discount,
    gstRate,
    gstAmount,
    total: base + gstAmount,
  }
}

export function PurchaseFormPage() {
  const navigate = useNavigate()
  const suppliers = useSupplierStore((s) => s.suppliers)
  const products = useProductStore((s) => s.products)
  const createPurchase = usePurchaseStore((s) => s.createPurchase)
  const adjustStock = useProductStore((s) => s.adjustStock)

  const [supplierId, setSupplierId] = useState('')
  const [supplierInvoice, setSupplierInvoice] = useState('')
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [additionalDiscount, setAdditionalDiscount] = useState(0)
  const [payNow, setPayNow] = useState(false)

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
    const lineDiscount = items.reduce((s, i) => s + i.discount, 0)
    const discount = lineDiscount + additionalDiscount
    const gst = items.reduce((s, i) => s + i.gstAmount, 0)
    return {
      subtotal,
      discount,
      cgst: Math.round(gst / 2),
      sgst: Math.round(gst / 2),
      grandTotal: Math.max(0, subtotal - discount) + gst,
    }
  }, [items, additionalDiscount])

  const addProduct = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? purchaseLine(product, i.qty + 1, i.price, i.discount)
            : i,
        )
      }
      return [...prev, purchaseLine(product, 1, product.purchasePrice, 0)]
    })
  }

  const updateItem = (id: string, patch: Partial<PurchaseItem>) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const merged = { ...i, ...patch }
        const product = products.find((p) => p.id === i.productId)
        if (!product) return merged
        return purchaseLine(product, merged.qty, merged.price, merged.discount)
      }),
    )
  }

  const submit = () => {
    if (!supplierId) {
      toast.warning('Select supplier', 'Choose a supplier for this bill.')
      return
    }
    if (items.length === 0) {
      toast.warning('No items', 'Add at least one product to the bill.')
      return
    }
    const bill = createPurchase(
      {
        supplierId,
        items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        cgst: totals.cgst,
        sgst: totals.sgst,
        grandTotal: totals.grandTotal,
      },
      supplierInvoice,
      payNow ? { method: 'bank', amount: totals.grandTotal } : undefined,
    )
    items.forEach((i) => adjustStock(i.productId, i.qty))
    toast.success('Purchase bill created', `${bill.billNumber} saved and stock updated.`)
    navigate('/purchases/bills')
  }

  return (
    <div>
      <PageHeader
        title="New Purchase Bill"
        description="Record goods received from a supplier"
        icon={<ShoppingBag className="h-5 w-5" />}
      >
        <Button variant="outline" size="sm" onClick={() => navigate('/purchases')}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-4xl p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label>Supplier *</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Supplier Invoice #</Label>
            <Input value={supplierInvoice} onChange={(e) => setSupplierInvoice(e.target.value)} placeholder="SF-4001" />
          </div>
          <div className="grid gap-2">
            <Label>Record payment now</Label>
            <button
              type="button"
              onClick={() => setPayNow((v) => !v)}
              className={`h-9 rounded-md border px-3 text-sm transition-colors ${
                payNow ? 'border-primary bg-primary/10 font-medium text-primary' : 'bg-muted text-muted-foreground'
              }`}
            >
              {payNow ? 'Paid on save' : 'Mark unpaid'}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-lg border bg-card p-4 shadow-sm">
          <Label className="mb-2 block">Add Products</Label>
          <ProductSearch onSelect={addProduct} />
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border bg-card shadow-sm">
          {items.length === 0 ? (
            <EmptyState
              title="No items yet"
              description="Search products above to add them to this bill."
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="w-20 px-2 py-2 text-right">Qty</th>
                  <th className="w-28 px-2 py-2 text-right">Price</th>
                  <th className="w-16 px-2 py-2 text-right">GST</th>
                  <th className="w-28 px-3 py-2 text-right">Total</th>
                  <th className="w-10 px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b">
                    <td className="px-3 py-2">
                      <p className="font-medium">{i.productName}</p>
                      <p className="text-[11px] text-muted-foreground">{i.sku}</p>
                    </td>
                    <td className="px-2 py-2">
                      <QtyStepper
                        value={i.qty}
                        onChange={(q) => updateItem(i.id, { qty: Math.max(1, q) })}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        type="number"
                        value={i.price}
                        onChange={(e) => updateItem(i.id, { price: Number(e.target.value) || 0 })}
                        className="h-8 text-right tabular"
                      />
                    </td>
                    <td className="px-2 py-2 text-right text-xs text-muted-foreground">{i.gstRate}%</td>
                    <td className="px-3 py-2 text-right font-semibold tabular">{formatCurrency(i.total)}</td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => setItems((prev) => prev.filter((x) => x.id !== i.id))}
                        className="rounded p-1.5 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="rounded-lg border bg-card p-3">
            <Label className="text-xs">Additional Discount (₹)</Label>
            <Input
              type="number"
              min={0}
              value={additionalDiscount}
              onChange={(e) => setAdditionalDiscount(Math.max(0, Number(e.target.value) || 0))}
              className="mt-1 h-8 w-32 text-right tabular"
            />
          </div>
          <div className="w-64 space-y-1.5 rounded-lg border bg-card p-4 text-sm shadow-sm">
            <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
            <Row label="Discount" value={`− ${formatCurrency(totals.discount)}`} />
            <Row label="GST" value={formatCurrency(totals.cgst + totals.sgst)} />
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Grand Total</span>
              <span className="tabular">{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/purchases')}>Cancel</Button>
          <Button variant="success" onClick={submit}>
            <Save className="h-4 w-4" /> Save Purchase Bill
          </Button>
        </div>
      </div>
    </div>
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

function QtyStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <button type="button" className="h-7 w-7 rounded-l-md border bg-background hover:bg-muted" onClick={() => onChange(value - 1)}>−</button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 1)}
        className="h-7 w-12 border-y text-center text-sm tabular focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <button type="button" className="h-7 w-7 rounded-r-md border bg-background hover:bg-muted" onClick={() => onChange(value + 1)}>+</button>
    </div>
  )
}
