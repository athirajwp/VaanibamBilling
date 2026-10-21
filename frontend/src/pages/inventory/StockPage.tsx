import { useMemo, useState } from 'react'
import { Boxes, Download } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { FilterBar } from '@/components/common/FilterBar'
import { DataTable, type Column } from '@/components/common/DataTable'
import { StockStatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProductStore } from '@/stores/useProductStore'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import { usePurchaseStore } from '@/stores/usePurchaseStore'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/format'
import { downloadCsv } from '@/lib/desktop/fs'
import { toast } from '@/stores/useToastStore'

interface StockRow {
  p: Product
  sold: number
  purchased: number
  value: number
  status: 'healthy' | 'low' | 'out'
}

export function StockPage() {
  const products = useProductStore((s) => s.products)
  const invoices = useInvoiceStore((s) => s.invoices)
  const purchases = usePurchaseStore((s) => s.purchases)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const rows = useMemo<StockRow[]>(() => {
    const soldMap = new Map<string, number>()
    invoices
      .filter((i) => i.status !== 'cancelled')
      .forEach((i) => i.items.forEach((it) => soldMap.set(it.productId, (soldMap.get(it.productId) ?? 0) + it.qty)))
    const purchasedMap = new Map<string, number>()
    purchases
      .filter((p) => p.status !== 'cancelled')
      .forEach((p) => p.items.forEach((it) => purchasedMap.set(it.productId, (purchasedMap.get(it.productId) ?? 0) + it.qty)))
    return products.map((p) => {
      const sold = soldMap.get(p.id) ?? 0
      const purchased = purchasedMap.get(p.id) ?? 0
      const status: StockRow['status'] =
        p.currentStock === 0 ? 'out' : p.currentStock <= p.minStock ? 'low' : 'healthy'
      return {
        p,
        sold,
        purchased,
        value: p.currentStock * p.purchasePrice,
        status,
      }
    })
  }, [products, invoices, purchases])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (category !== 'all' && r.p.category !== category) return false
      if (q && !r.p.name.toLowerCase().includes(q) && !r.p.sku.toLowerCase().includes(q)) return false
      return true
    })
  }, [rows, search, category])

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products])

  const exportCsv = async () => {
    await downloadCsv('stock.csv', [
      ['Product', 'SKU', 'Opening', 'Purchased', 'Sold', 'Current', 'Status', 'Value'],
      ...filtered.map((r) => [
        r.p.name,
        r.p.sku,
        String(r.p.openingStock),
        String(r.purchased),
        String(r.sold),
        String(r.p.currentStock),
        r.status,
        String(r.value),
      ]),
    ])
    toast.success('Stock exported', 'stock.csv downloaded.')
  }

  return (
    <div>
      <PageHeader
        title="Stock Table"
        description="Opening, purchases, sales and current stock"
        icon={<Boxes className="h-5 w-5" />}
      >
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </PageHeader>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          containerClassName="w-64"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-8 w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <div className="p-4">
        <DataTable columns={stockCols} data={filtered} keyField={(r) => r.p.id} />
      </div>
    </div>
  )
}

const stockCols: Column<StockRow>[] = [
  {
    key: 'product',
    header: 'Product',
    render: (r) => (
      <div>
        <p className="font-medium">{r.p.name}</p>
        <p className="text-[11px] text-muted-foreground">{r.p.sku}</p>
      </div>
    ),
  },
  { key: 'opening', header: 'Opening', className: 'text-right', render: (r) => <span className="tabular text-muted-foreground">{r.p.openingStock}</span> },
  { key: 'purchased', header: 'Purchased', className: 'text-right', render: (r) => <span className="tabular text-success">+{r.purchased}</span> },
  { key: 'sold', header: 'Sold', className: 'text-right', render: (r) => <span className="tabular text-destructive">−{r.sold}</span> },
  { key: 'current', header: 'Current', className: 'text-right', render: (r) => <span className="font-bold tabular">{r.p.currentStock}</span> },
  { key: 'min', header: 'Min', className: 'text-right', render: (r) => <span className="tabular text-muted-foreground">{r.p.minStock}</span> },
  {
    key: 'value',
    header: 'Value',
    className: 'text-right',
    render: (r) => <span className="tabular text-muted-foreground">{formatCurrency(r.value)}</span>,
  },
  { key: 'status', header: 'Status', render: (r) => <StockStatusBadge status={r.status} /> },
]
