import { useMemo } from 'react'
import { Warehouse, MapPin, User } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProductStore } from '@/stores/useProductStore'
import { formatCurrency } from '@/lib/format'

export function GodownsPage() {
  const godowns = useProductStore((s) => s.godowns)
  const products = useProductStore((s) => s.products)

  const rows = useMemo(
    () =>
      godowns.map((g) => {
        const items = products.filter((p) => p.godown === g.name)
        const value = items.reduce((s, p) => s + p.currentStock * p.purchasePrice, 0)
        const units = items.reduce((s, p) => s + p.currentStock, 0)
        return { g, items, value, units }
      }),
    [godowns, products],
  )

  const totalValue = rows.reduce((s, r) => s + r.value, 0)

  return (
    <div>
      <PageHeader
        title="Godowns"
        description={`${godowns.length} storage locations · ${formatCurrency(totalValue)} total stock`}
        icon={<Warehouse className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ g, items, value, units }) => (
          <Card key={g.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-primary" /> {g.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {g.address && (
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {g.address}
                </p>
              )}
              {g.manager && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3.5 w-3.5" /> {g.manager}
                </p>
              )}
              {g.description && <p className="text-xs text-muted-foreground">{g.description}</p>}
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Products</span>
                <span className="font-semibold">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Units</span>
                <span className="font-semibold tabular">{units}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stock value</span>
                <span className="font-semibold tabular">{formatCurrency(value)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
