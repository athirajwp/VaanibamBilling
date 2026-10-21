import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Package, Plus, Upload, Download, Eye, Pencil, Copy, Trash2, MoreHorizontal, Boxes, IndianRupee, Tag, ScanBarcode } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { FilterBar } from '@/components/common/FilterBar'
import { DataTable, type Column } from '@/components/common/DataTable'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ProductForm } from '@/components/products/ProductForm'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProductStore } from '@/stores/useProductStore'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/format'
import { downloadCsv } from '@/lib/desktop/fs'
import { toast } from '@/stores/useToastStore'
import { Drawer } from '@/components/common/Drawer'
import { Separator } from '@/components/ui/separator'

export function ProductsPage() {
  const navigate = useNavigate()
  const products = useProductStore((s) => s.products)
  const categories = useProductStore((s) => s.categories)
  const deleteProduct = useProductStore((s) => s.deleteProduct)
  const duplicateProduct = useProductStore((s) => s.duplicateProduct)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [stock, setStock] = useState('all')
  const [tax, setTax] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false
      if (category !== 'all' && p.category !== category) return false
      if (stock === 'low' && !(p.currentStock <= p.minStock && p.currentStock > 0)) return false
      if (stock === 'out' && p.currentStock !== 0) return false
      if (tax === 'gst' && p.gstRate === 0) return false
      if (tax === 'non-gst' && p.gstRate !== 0) return false
      return true
    })
  }, [products, search, category, stock, tax])

  const [params, setParams] = useSearchParams()
  const viewProduct = products.find((p) => p.id === params.get('view'))

  const handleExport = async () => {
    await downloadCsv('products.csv', [
      ['Name', 'SKU', 'Category', 'Purchase Price', 'Selling Price', 'Stock', 'GST'],
      ...filtered.map((p) => [p.name, p.sku, p.category, String(p.purchasePrice), String(p.sellingPrice), String(p.currentStock), String(p.gstRate)]),
    ])
    toast.success('Export started', 'products.csv downloaded.')
  }

  const handleImport = () => {
    toast.info('Import', 'Paste or upload a CSV file (demo).')
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${products.length} products in catalogue`}
        icon={<Package className="h-5 w-5" />}
      >
        <Button variant="outline" size="sm" onClick={handleImport}>
          <Upload className="h-4 w-4" /> Import
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <ProductForm
          triggerLabel={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          }
        />
      </PageHeader>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          containerClassName="w-64"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stock} onValueChange={setStock}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Stock status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tax} onValueChange={setTax}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="Tax" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tax</SelectItem>
            <SelectItem value="gst">GST</SelectItem>
            <SelectItem value="non-gst">Non-GST</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <div className="p-4">
        <DataTable
          columns={productColumns({
            onView: (p) => navigate(`/products/list?view=${p.id}`),
            onEdit: (p) => setEditProduct(p),
            onDuplicate: (p) => duplicateProduct(p.id),
            onDelete: (p) => setDeleteId(p.id),
          })}
          data={filtered}
          keyField={(p) => p.id}
        />
      </div>

      {editProduct && (
        <ProductForm
          product={editProduct}
          open
          onOpenChange={(o) => !o && setEditProduct(null)}
          triggerLabel={<span />}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete product?"
        description="This will permanently remove the product from your catalogue."
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteProduct(deleteId)}
      />

      <Drawer
        open={!!viewProduct}
        onOpenChange={(o) => {
          if (!o) {
            params.delete('view')
            setParams(params, { replace: true })
          }
        }}
        title={viewProduct?.name ?? 'Product'}
        description={viewProduct?.sku}
        className="max-w-md"
      >
        {viewProduct && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                {viewProduct.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{viewProduct.name}</p>
                <p className="text-xs text-muted-foreground">{viewProduct.category} · {viewProduct.brand}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniStat icon={<IndianRupee className="h-4 w-4" />} label="Selling" value={formatCurrency(viewProduct.sellingPrice)} />
              <MiniStat icon={<IndianRupee className="h-4 w-4" />} label="Purchase" value={formatCurrency(viewProduct.purchasePrice)} />
              <MiniStat icon={<Boxes className="h-4 w-4" />} label="Stock" value={`${viewProduct.currentStock} ${viewProduct.unit}`} />
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <DetailRow icon={<ScanBarcode className="h-4 w-4" />} label="Barcode" value={viewProduct.barcode ?? '—'} />
              <DetailRow icon={<Tag className="h-4 w-4" />} label="GST" value={`${viewProduct.gstRate}%`} />
              <DetailRow label="HSN" value={viewProduct.hsn ?? '—'} />
              <DetailRow label="Min Stock" value={String(viewProduct.minStock)} />
              <DetailRow label="Godown" value={viewProduct.godown ?? '—'} />
            </div>

            {viewProduct.isCrackers && viewProduct.crackers && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Bulk Pricing
                  </p>
                  <div className="mt-2 space-y-1">
                    {viewProduct.crackers.bulkPricing.map((tier) => (
                      <div key={tier.id} className="flex justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm">
                        <span>
                          {tier.from}–{tier.to ?? '100+'} boxes
                        </span>
                        <span className="font-semibold tabular">{formatCurrency(tier.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2">
      <div className="mx-auto mb-1 flex justify-center text-primary">{icon}</div>
      <p className="text-xs font-bold tabular">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function productColumns(actions: {
  onView: (p: Product) => void
  onEdit: (p: Product) => void
  onDuplicate: (p: Product) => void
  onDelete: (p: Product) => void
}): Column<Product>[] {
  return [
    {
      key: 'image',
      header: 'Image',
      className: 'w-12',
      render: (p) => (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary">
          {p.name.slice(0, 2).toUpperCase()}
        </div>
      ),
    },
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
    {
      key: 'category',
      header: 'Category',
      render: (p) => <Badge variant="secondary">{p.category}</Badge>,
    },
    {
      key: 'price',
      header: 'Selling Price',
      className: 'text-right',
      render: (p) => (
        <div className="text-right">
          <p className="font-semibold tabular">{formatCurrency(p.sellingPrice)}</p>
          {p.wholesalePrice ? (
            <p className="text-[11px] text-muted-foreground">Whl {formatCurrency(p.wholesalePrice)}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      className: 'text-right',
      render: (p) => (
        <div className="text-right">
          <p className={`font-semibold tabular ${p.currentStock === 0 ? 'text-destructive' : p.currentStock <= p.minStock ? 'text-warning' : ''}`}>
            {p.currentStock} {p.unit}
          </p>
          <p className="text-[11px] text-muted-foreground">min {p.minStock}</p>
        </div>
      ),
    },
    {
      key: 'gst',
      header: 'GST',
      className: 'text-center',
      render: (p) => <span className="text-sm tabular">{p.gstRate}%</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <Badge variant={p.status === 'active' ? 'success' : 'muted'}>{p.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-14',
      render: (p) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-md p-1.5 hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => actions.onView(p)}>
              <Eye className="h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onEdit(p)}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onDuplicate(p)}>
              <Copy className="h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => actions.onDelete(p)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
