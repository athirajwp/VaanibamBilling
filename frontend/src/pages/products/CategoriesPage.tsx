import { useMemo, useState } from 'react'
import { Layers, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useProductStore } from '@/stores/useProductStore'
import { formatCurrency } from '@/lib/format'
import { toast } from '@/stores/useToastStore'

export function CategoriesPage() {
  const categories = useProductStore((s) => s.categories)
  const products = useProductStore((s) => s.products)
  const addCategory = useProductStore((s) => s.addCategory)
  const deleteCategory = useProductStore((s) => s.deleteCategory)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const count = useMemo(
    () => (categoryId: string) => products.filter((p) => p.category === categoryId).length,
    [products],
  )

  const stockValue = (categoryId: string) =>
    products
      .filter((p) => p.category === categoryId)
      .reduce((s, p) => s + p.currentStock * p.purchasePrice, 0)

  const save = () => {
    if (!name.trim()) {
      toast.warning('Name required', 'Enter a category name.')
      return
    }
    addCategory({ name: name.trim(), description })
    setOpen(false)
    setName('')
    setDescription('')
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description={`${categories.length} product categories`}
        icon={<Layers className="h-5 w-5" />}
      >
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </PageHeader>

      <div className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">
                  {count(cat.name)} products · {formatCurrency(stockValue(cat.name))} stock
                </p>
              </div>
              <button
                onClick={() => setDeleteId(cat.id)}
                className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Delete category"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal open={open} onOpenChange={setOpen} title="Add Category">
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Category Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sparklers" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Add Category</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete category?"
        description="Products in this category will remain but become uncategorised."
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteCategory(deleteId)}
      />
    </div>
  )
}
