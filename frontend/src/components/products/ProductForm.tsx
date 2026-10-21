import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trash2, Plus, UploadCloud, ImageIcon } from 'lucide-react'
import { useProductStore } from '@/stores/useProductStore'
import type { Product, BulkPriceTier } from '@/types'
import { uid } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional().or(z.literal('')),
  category: z.string().min(1, 'Select a category'),
  brand: z.string().optional().or(z.literal('')),
  unit: z.string().min(1, 'Unit is required'),
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0, 'Selling price required'),
  mrp: z.coerce.number().min(0).optional(),
  wholesalePrice: z.coerce.number().min(0).optional(),
  taxType: z.enum(['gst', 'non-gst', 'exempt']),
  gstRate: z.coerce.number().min(0).max(100),
  hsn: z.string().optional().or(z.literal('')),
  openingStock: z.coerce.number().min(0),
  minStock: z.coerce.number().min(0),
  godown: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']),
  isCrackers: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface ProductFormProps {
  triggerLabel: React.ReactNode
  product?: Product
  onSaved?: (product: Product) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ProductForm({ triggerLabel, product, onSaved, open: controlledOpen, onOpenChange }: ProductFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (o: boolean) => {
    setInternalOpen(o)
    onOpenChange?.(o)
  }
  const addProduct = useProductStore((s) => s.addProduct)
  const updateProduct = useProductStore((s) => s.updateProduct)
  const categories = useProductStore((s) => s.categories)
  const godowns = useProductStore((s) => s.godowns)

  const [tiers, setTiers] = useState<BulkPriceTier[]>(product?.crackers?.bulkPricing ?? [
    { id: uid(), from: 1, to: 10, price: 0 },
    { id: uid(), from: 11, to: 50, price: 0 },
    { id: uid(), from: 51, to: null, price: 0 },
  ])
  const [piecesPerBox, setPiecesPerBox] = useState(product?.crackers?.piecesPerBox ?? 10)
  const productType = product?.crackers?.productType ?? 'Sparkler'

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku,
          barcode: product.barcode ?? '',
          category: product.category,
          brand: product.brand ?? '',
          unit: product.unit,
          purchasePrice: product.purchasePrice,
          sellingPrice: product.sellingPrice,
          mrp: product.mrp,
          wholesalePrice: product.wholesalePrice,
          taxType: product.taxType,
          gstRate: product.gstRate,
          hsn: product.hsn ?? '',
          openingStock: product.openingStock,
          minStock: product.minStock,
          godown: product.godown ?? '',
          status: product.status,
          isCrackers: product.isCrackers ?? false,
        }
      : {
          name: '',
          sku: '',
          barcode: '',
          category: '',
          brand: '',
          unit: 'Box',
          purchasePrice: 0,
          sellingPrice: 0,
          mrp: 0,
          wholesalePrice: 0,
          taxType: 'gst',
          gstRate: 18,
          hsn: '',
          openingStock: 0,
          minStock: 0,
          godown: '',
          status: 'active',
          isCrackers: false,
        },
  })

  const isCrackers = watch('isCrackers')

  const onSubmit = (values: FormValues) => {
    const payload: Omit<Product, 'id' | 'createdAt'> = {
      ...values,
      currentStock: product?.currentStock ?? values.openingStock,
      mrp: values.mrp || undefined,
      wholesalePrice: values.wholesalePrice || undefined,
      crackers: isCrackers
        ? {
            productType,
            boxQuantity: piecesPerBox,
            piecesPerBox,
            purchaseUnit: 'Box',
            sellingUnit: 'Piece',
            bulkPricing: tiers.filter((t) => t.price > 0),
          }
        : undefined,
    }
    if (product) {
      updateProduct(product.id, payload)
      onSaved?.({ ...product, ...payload })
    } else {
      const created = addProduct(payload)
      onSaved?.(created)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div onClick={() => setOpen(true)}>{triggerLabel}</div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogDescription>
            Configure the product details, pricing and inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Tabs defaultValue="basic">
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger>
              <TabsTrigger value="pricing" className="flex-1">Pricing</TabsTrigger>
              <TabsTrigger value="tax" className="flex-1">Tax</TabsTrigger>
              <TabsTrigger value="inventory" className="flex-1">Inventory</TabsTrigger>
              <TabsTrigger value="image" className="flex-1">Image</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="grid gap-4 pt-4">
              <div className="grid gap-2">
                <Label>Product Name *</Label>
                <Input placeholder='5½" Lakshmi Sparkler' {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>SKU *</Label>
                  <Input placeholder="SKU-0001" {...register('sku')} />
                </div>
                <div className="grid gap-2">
                  <Label>Barcode</Label>
                  <Input placeholder="8901048..." {...register('barcode')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={watch('category')} onValueChange={(v) => setValue('category', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Brand</Label>
                  <Input placeholder="Lakshmi" {...register('brand')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Unit</Label>
                  <Select value={watch('unit')} onValueChange={(v) => setValue('unit', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Box', 'Piece', 'Pack', 'Kg', 'Gram', 'Carton'].map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-3 pb-1">
                  <Switch
                    checked={isCrackers}
                    onCheckedChange={(v) => setValue('isCrackers', v)}
                  />
                  <div>
                    <Label>Crackers product</Label>
                    <p className="text-[11px] text-muted-foreground">Enable box & bulk pricing</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Purchase Price (₹)</Label>
                  <Input type="number" min={0} {...register('purchasePrice')} />
                </div>
                <div className="grid gap-2">
                  <Label>Selling Price (₹) *</Label>
                  <Input type="number" min={0} {...register('sellingPrice')} />
                  {errors.sellingPrice && <p className="text-xs text-destructive">{errors.sellingPrice.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>MRP (₹)</Label>
                  <Input type="number" min={0} {...register('mrp')} />
                </div>
                <div className="grid gap-2">
                  <Label>Wholesale Price (₹)</Label>
                  <Input type="number" min={0} {...register('wholesalePrice')} />
                </div>
              </div>

              {isCrackers && (
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="text-sm font-semibold">Crackers Bulk Pricing</Label>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Pieces per box</Label>
                      <Input
                        type="number"
                        min={1}
                        value={piecesPerBox}
                        onChange={(e) => setPiecesPerBox(Number(e.target.value) || 1)}
                        className="h-8 w-20 text-center"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Box Price ₹{watch('sellingPrice') || 0} · Piece Price ₹{((watch('sellingPrice') || 0) / Math.max(1, piecesPerBox)).toFixed(0)}
                  </p>
                  <div className="mt-3 space-y-2">
                    {tiers.map((tier, i) => (
                      <div key={tier.id} className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={tier.from}
                          onChange={(e) => updateTier(i, { from: Number(e.target.value) || 0 })}
                          className="h-8 w-20 text-center"
                        />
                        <span className="text-xs text-muted-foreground">–</span>
                        <Input
                          type="text"
                          value={tier.to === null ? '100+' : tier.to}
                          onChange={(e) => {
                            const v = e.target.value.replace('+', '')
                            updateTier(i, { to: v === '' ? null : Number(v) })
                          }}
                          className="h-8 w-20 text-center"
                        />
                        <Input
                          type="number"
                          value={tier.price}
                          onChange={(e) => updateTier(i, { price: Number(e.target.value) || 0 })}
                          className="h-8 flex-1 text-right"
                          placeholder="Price"
                        />
                        <span className="w-12 text-xs text-muted-foreground">boxes</span>
                        <button
                          type="button"
                          onClick={() => removeTier(i)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTier()}
                    >
                      <Plus className="h-4 w-4" /> Add Tier
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tax" className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Tax Type</Label>
                  <Select value={watch('taxType')} onValueChange={(v) => setValue('taxType', v as FormValues['taxType'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gst">GST</SelectItem>
                      <SelectItem value="non-gst">Non-GST</SelectItem>
                      <SelectItem value="exempt">Exempt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>GST %</Label>
                  <Select value={String(watch('gstRate'))} onValueChange={(v) => setValue('gstRate', Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 5, 12, 18, 28].map((r) => (
                        <SelectItem key={r} value={String(r)}>{r}%</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>HSN Code</Label>
                <Input placeholder="3605" {...register('hsn')} />
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Opening Stock</Label>
                  <Input type="number" min={0} {...register('openingStock')} />
                </div>
                <div className="grid gap-2">
                  <Label>Minimum Stock</Label>
                  <Input type="number" min={0} {...register('minStock')} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Godown</Label>
                <Select value={watch('godown')} onValueChange={(v) => setValue('godown', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select godown" />
                  </SelectTrigger>
                  <SelectContent>
                    {godowns.map((g) => (
                      <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="image" className="pt-4">
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
                {product?.image ? (
                  <img src={product.image} alt={product.name} className="h-24 w-24 rounded-lg object-cover" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                )}
                <p className="mt-3 text-sm font-medium">Drag & drop or click to upload</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                <Button type="button" variant="outline" size="sm" className="mt-3">
                  <UploadCloud className="h-4 w-4" /> Choose Image
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">{product ? 'Save Changes' : 'Add Product'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  function updateTier(index: number, patch: Partial<BulkPriceTier>) {
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)))
  }

  function removeTier(index: number) {
    setTiers((prev) => prev.filter((_, i) => i !== index))
  }

  function addTier() {
    const last = tiers[tiers.length - 1]
    setTiers((prev) => [
      ...prev,
      { id: uid(), from: (last?.to ?? 50) + 1, to: null, price: 0 },
    ])
  }
}
