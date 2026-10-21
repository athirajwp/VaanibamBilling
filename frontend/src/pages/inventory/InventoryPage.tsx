import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boxes, IndianRupee, AlertTriangle, PackageX, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column } from '@/components/common/DataTable'
import { StockStatusBadge } from '@/components/common/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProductStore } from '@/stores/useProductStore'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/format'

export function InventoryPage() {
  const navigate = useNavigate()
  const products = useProductStore((s) => s.products)

  const stats = useMemo(() => {
    const stockValue = products.reduce((s, p) => s + p.currentStock * p.purchasePrice, 0)
    const low = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock).length
    const out = products.filter((p) => p.currentStock === 0).length
    const categories = new Set(products.map((p) => p.category)).size
    return { stockValue, low, out, categories }
  }, [products])

  const rows = useMemo(() => {
    const status = (p: Product): 'healthy' | 'low' | 'out' =>
      p.currentStock === 0 ? 'out' : p.currentStock <= p.minStock ? 'low' : 'healthy'
    return products
      .filter((p) => status(p) !== 'healthy')
      .slice(0, 8)
      .map((p) => ({ p, status: status(p) }))
  }, [products])

  return (
    <div>
      <PageHeader
        title="Inventory"
        description={`${products.length} products tracked`}
        icon={<Boxes className="h-5 w-5" />}
      >
        <Button variant="outline" size="sm" onClick={() => navigate('/inventory/stock')}>
          Stock Table
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/inventory/adjustments')}>
          Adjustments
        </Button>
        <Button size="sm" onClick={() => navigate('/products/new')}>
          <Boxes className="h-4 w-4" /> Add Product
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
        <StatCard title="Stock Value" value={formatCurrency(stats.stockValue)} icon={<IndianRupee className="h-4 w-4" />} />
        <StatCard title="Low Stock" value={String(stats.low)} icon={<AlertTriangle className="h-4 w-4" />} iconClassName="bg-warning/10 text-warning" onClick={() => navigate('/inventory/stock')} />
        <StatCard title="Out of Stock" value={String(stats.out)} icon={<PackageX className="h-4 w-4" />} iconClassName="bg-destructive/10 text-destructive" onClick={() => navigate('/inventory/stock')} />
        <StatCard title="Categories" value={String(stats.categories)} icon={<Boxes className="h-4 w-4" />} iconClassName="bg-info/10 text-info" />
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 pt-0 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Stock Alerts
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/inventory/stock')}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={alertsCols}
              data={rows}
              keyField={(r) => r.p.id}
              onRowClick={(r) => navigate(`/products/list?view=${r.p.id}`)}
              stickyHeader={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/inventory/adjustments')}>
              <Boxes className="h-4 w-4" /> Adjust stock
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/products/list')}>
              <Boxes className="h-4 w-4" /> Manage products
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/inventory/godowns')}>
              <Boxes className="h-4 w-4" /> Godowns
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const alertsCols: Column<{ p: Product; status: 'healthy' | 'low' | 'out' }>[] = [
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
  { key: 'current', header: 'In Stock', className: 'text-right', render: (r) => <span className="font-semibold tabular">{r.p.currentStock}</span> },
  { key: 'min', header: 'Min Level', className: 'text-right', render: (r) => <span className="tabular text-muted-foreground">{r.p.minStock}</span> },
  {
    key: 'value',
    header: 'Value',
    className: 'text-right',
    render: (r) => <span className="tabular text-muted-foreground">{formatCurrency(r.p.currentStock * r.p.purchasePrice)}</span>,
  },
  { key: 'status', header: 'Status', render: (r) => <StockStatusBadge status={r.status} /> },
]
