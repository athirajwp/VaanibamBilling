import { Trash2 } from 'lucide-react'
import type { InvoiceItem } from '@/types'
import { formatCurrency } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/common/EmptyState'

interface InvoiceItemsTableProps {
  items: InvoiceItem[]
  onUpdate: (id: string, patch: Partial<InvoiceItem>) => void
  onRemove: (id: string) => void
  onSelectProduct: () => void
}

export function InvoiceItemsTable({ items, onUpdate, onRemove, onSelectProduct }: InvoiceItemsTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Trash2 className="h-6 w-6" />}
        title="No items added yet"
        description="Search and select a product to start building your invoice."
        action={{ label: 'Search Product', onClick: onSelectProduct }}
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2">Product</th>
            <th className="w-20 px-2 py-2 text-right">Qty</th>
            <th className="w-28 px-2 py-2 text-right">Price</th>
            <th className="w-24 px-2 py-2 text-right">Discount</th>
            <th className="w-16 px-2 py-2 text-right">GST</th>
            <th className="w-28 px-3 py-2 text-right">Total</th>
            <th className="w-10 px-2 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b transition-colors hover:bg-muted/40">
              <td className="px-3 py-1.5">
                <p className="truncate font-medium">{item.productName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{item.sku}</p>
              </td>
              <td className="px-2 py-1.5">
                <QtyInput
                  value={item.qty}
                  onChange={(qty) => onUpdate(item.id, { qty: Math.max(0, qty) })}
                />
              </td>
              <td className="px-2 py-1.5">
                <MoneyInput
                  value={item.price}
                  onChange={(price) => onUpdate(item.id, { price: Math.max(0, price) })}
                />
              </td>
              <td className="px-2 py-1.5">
                <MoneyInput
                  value={item.discount}
                  onChange={(discount) => onUpdate(item.id, { discount: Math.max(0, discount) })}
                />
              </td>
              <td className="px-2 py-1.5 text-right text-xs text-muted-foreground">
                {item.gstRate}%
              </td>
              <td className="px-3 py-1.5 text-right font-semibold tabular">
                {formatCurrency(item.total)}
              </td>
              <td className="px-2 py-1.5">
                <button
                  onClick={() => onRemove(item.id)}
                  title="Remove item"
                  className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QtyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        type="button"
        className="h-7 w-7 rounded-l-md border bg-background text-sm font-semibold text-muted-foreground hover:bg-muted"
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-7 w-12 rounded-none border-y text-center text-sm tabular focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <button
        type="button"
        className="h-7 w-7 rounded-r-md border bg-background text-sm font-semibold text-muted-foreground hover:bg-muted"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}

function MoneyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Input
      type="number"
      min={0}
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={cn('h-8 px-2 text-right text-sm tabular')}
    />
  )
}
