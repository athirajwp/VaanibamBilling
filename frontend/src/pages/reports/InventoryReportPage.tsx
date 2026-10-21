import { useMemo } from 'react'
import { Boxes, IndianRupee, AlertTriangle, PackageX, Download } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column } from '@/components/common/DataTable'
import { StockStatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { useProductStore } from '@/stores/useProductStore'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/format'
import { downloadCsv } from '@/lib/desktop/fs'
import { toast } from '@/stores/useToastStore'

export function InventoryReportPage() {
  const products = useProductStore((s) => s.products)

  const stats = useMemo(() => {
    const value = products.reduce((s, p) => s + p.currentStock * p.purchasePrice, 0)
    const low = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock).length
    const out = products.filter((p) => p.currentStock === 0).length
    return { value, low, out }
  }, [products])

  const exportCsv = async () => {
    await downloadCsv('inventory-report.csv', [
      ['Product', 'SKU', 'Category', 'Current', 'Min', 'Purchase Price', 'Value', 'Status'],
      ...products.map((p) => [
        p.name,
        p.sku,
        p.category,
        String(p.currentStock),
        String(p.minStock),
        String(p.purchasePrice),
        String(p.currentStock * p.purchasePrice),
        p.currentStock === 0 ? 'out' : p.currentStock <= p.minStock ? 'low' : 'healthy',
      ]),
    ])
    toast.success('Inventory exported', 'inventory-report.csv downloaded.')
  }

  return (
    <div>
      <PageHeader
        title="Inventory Report"
        description={`${products.length} products`}
        icon={<Boxes className="h-5 w-5" />}
      >
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-3 p-4">
        <StatCard title="Stock Value" value={formatCurrency(stats.value)} icon={<IndianRupee className="h-4 w-4" />} />
        <StatCard title="Low Stock" value={String(stats.low)} icon={<AlertTriangle className="h-4 w-4" />} iconClassName="bg-warning/10 text-warning" />
        <StatCard title="Out of Stock" value={String(stats.out)} icon={<PackageX className="h-4 w-4" />} iconClassName="bg-destructive/10 text-destructive" />
      </div>

      <div className="p-4 pt-0">
        <DataTable
          columns={cols}
          data={products}
          keyField={(p) => p.id}
        />
      </div>
    </div>
  )
}

const cols: Column<Product>[] = [
  {
    key: 'product',
    header: 'Product',
    render: (p) => (
      <div>
        <p className="font-medium">{p.name}</p>
        <p className="text-[11px] text-muted-foreground">{p.sku}</p>
      </div>
    ),
  },
  { key: 'category', header: 'Category', render: (p) => <span className="text-muted-foreground">{p.category}</span> },
  { key: 'current', header: 'In Stock', className: 'text-right', render: (p) => <span className="font-semibold tabular">{p.currentStock}</span> },
  { key: 'min', header: 'Min', className: 'text-right', render: (p) => <span className="tabular text-muted-foreground">{p.minStock}</span> },
  { key: 'value', header: 'Stock Value', className: 'text-right', render: (p) => <span className="tabular">{formatCurrency(p.currentStock * p.purchasePrice)}</span> },
  {
    key: 'status',
    header: 'Status',
    render: (p) => (
      <StockStatusBadge
        status={p.currentStock === 0 ? 'out' : p.currentStock <= p.minStock ? 'low' : 'healthy'}
      />
    ),
  },
]
