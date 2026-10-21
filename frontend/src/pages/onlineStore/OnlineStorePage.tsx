import { useMemo, useState } from 'react'
import { Globe, Store, Eye, ShoppingBag, PackageCheck, ToggleLeft, Boxes } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/common/DataTable'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useProductStore } from '@/stores/useProductStore'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/stores/useToastStore'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/types'

const themes = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'vibrant', label: 'Vibrant' },
  { value: 'dark', label: 'Dark' },
]

export function OnlineStorePage() {
  const settings = useSettingsStore((s) => s.settings)
  const updateOnlineStore = useSettingsStore((s) => s.updateOnlineStore)
  const products = useProductStore((s) => s.products)
  const business = useBusinessStore((s) => s.business)
  const [tab, setTab] = useState<'store' | 'products'>('store')
  const [form, setForm] = useState({
    storeName: settings.onlineStore.storeName,
    tagline: settings.onlineStore.tagline,
    contact: settings.onlineStore.contact,
    email: settings.onlineStore.email,
    address: settings.onlineStore.address,
    theme: settings.onlineStore.theme,
  })

  const published = useMemo(
    () => products.filter((p) => settings.onlineStore.productsPublished.includes(p.id)),
    [products, settings.onlineStore.productsPublished],
  )

  const toggleProduct = (product: Product) => {
    const current = settings.onlineStore.productsPublished
    const next = current.includes(product.id)
      ? current.filter((id) => id !== product.id)
      : [...current, product.id]
    updateOnlineStore({ productsPublished: next })
  }

  const save = () => {
    updateOnlineStore(form)
    toast.success('Store settings saved', `${form.storeName} updated.`)
  }

  const store = settings.onlineStore

  return (
    <div>
      <PageHeader
        title="Online Store"
        description={`${store.status === 'online' ? 'Store is live' : 'Store is offline'} · ${published.length} products published`}
        icon={<Globe className="h-5 w-5" />}
      >
        <Button variant="outline" size="sm" onClick={() => toast.info('Preview', 'Opening storefront preview (demo).')}>
          <Eye className="h-4 w-4" /> Preview Store
        </Button>
        <Button
          size="sm"
          variant={store.status === 'online' ? 'destructive' : 'success'}
          onClick={() => {
            updateOnlineStore({ status: store.status === 'online' ? 'offline' : 'online' })
            toast.success(store.status === 'online' ? 'Store taken offline' : 'Store is now live', 'Share the link with customers.')
          }}
        >
          {store.status === 'online' ? <ToggleLeft className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {store.status === 'online' ? 'Take Offline' : 'Go Live'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
        <StatCard title="Published Products" value={String(published.length)} icon={<PackageCheck className="h-4 w-4" />} />
        <StatCard title="Available Stock" value={String(published.reduce((s, p) => s + p.currentStock, 0))} icon={<Boxes className="h-4 w-4" />} iconClassName="bg-info/10 text-info" />
        <StatCard title="Listed Value" value={formatCurrency(published.reduce((s, p) => s + p.currentStock * p.sellingPrice, 0))} icon={<ShoppingBag className="h-4 w-4" />} iconClassName="bg-success/10 text-success" />
        <StatCard
          title="Store Status"
          value={store.status === 'online' ? 'Online' : 'Offline'}
          icon={<Store className="h-4 w-4" />}
          iconClassName={store.status === 'online' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}
        />
      </div>

      <div className="p-4 pt-0">
        <div className="mb-4 flex gap-1 rounded-lg border bg-muted/40 p-1">
          <Button
            variant={tab === 'store' ? 'secondary' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setTab('store')}
          >
            Store Settings
          </Button>
          <Button
            variant={tab === 'products' ? 'secondary' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setTab('products')}
          >
            Manage Products
          </Button>
        </div>

        {tab === 'store' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Store Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Store Name</Label>
                  <Input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Tagline</Label>
                  <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Contact Phone</Label>
                  <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Address</Label>
                  <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
                </div>
                <div className="grid gap-2">
                  <Label>Theme</Label>
                  <Select value={form.theme} onValueChange={(v) => setForm({ ...form, theme: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">Store visible to customers</p>
                    <p className="text-xs text-muted-foreground">Toggles your public storefront</p>
                  </div>
                  <Switch
                    checked={store.status === 'online'}
                    onCheckedChange={(v) => updateOnlineStore({ status: v ? 'online' : 'offline' })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={save}>Save Settings</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storefront Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-xl border">
                  <div className="h-20 bg-gradient-to-r from-primary to-info p-4 text-white">
                    <p className="text-lg font-bold">{form.storeName || business.name}</p>
                    <p className="text-xs opacity-90">{form.tagline || 'Your store, online.'}</p>
                  </div>
                  <div className="space-y-2 p-4">
                    {published.slice(0, 3).map((p) => (
                      <div key={p.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">Stock: {p.currentStock} {p.unit}</p>
                        </div>
                        <span className="text-sm font-semibold tabular">{formatCurrency(p.sellingPrice)}</span>
                      </div>
                    ))}
                    {published.length === 0 && (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        Publish products from the “Manage Products” tab.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'products' && (
          <Card>
            <CardHeader>
              <CardTitle>Publish Products</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={productCols({
                  published: store.productsPublished,
                  onToggle: toggleProduct,
                })}
                data={products}
                keyField={(p) => p.id}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function productCols(ctx: {
  published: string[]
  onToggle: (p: Product) => void
}): Column<Product>[] {
  return [
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
    { key: 'price', header: 'Price', className: 'text-right', render: (p) => <span className="font-semibold tabular">{formatCurrency(p.sellingPrice)}</span> },
    { key: 'stock', header: 'Stock', className: 'text-right', render: (p) => <span className="tabular">{p.currentStock}</span> },
    {
      key: 'status',
      header: 'Published',
      render: (p) => {
        const on = ctx.published.includes(p.id)
        return (
          <div className="flex items-center gap-2">
            <Badge variant={on ? 'success' : 'muted'}>{on ? 'Published' : 'Hidden'}</Badge>
            <Switch checked={on} onCheckedChange={() => ctx.onToggle(p)} />
          </div>
        )
      },
    },
  ]
}
