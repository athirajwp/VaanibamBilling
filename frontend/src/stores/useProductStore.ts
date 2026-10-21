import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { products, categories, godowns } from '@/mock'
import type { Product, ProductCategory, Godown } from '@/types'
import { uid } from '@/lib/utils'
import { toast } from './useToastStore'

interface ProductState {
  products: Product[]
  categories: ProductCategory[]
  godowns: Godown[]
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product
  updateProduct: (id: string, patch: Partial<Product>) => void
  deleteProduct: (id: string) => void
  duplicateProduct: (id: string) => void
  adjustStock: (productId: string, delta: number) => void
  addCategory: (category: Omit<ProductCategory, 'id'>) => void
  deleteCategory: (id: string) => void
  importProducts: (list: Omit<Product, 'id' | 'createdAt'>[]) => number
  exportProducts: () => Product[]
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products,
      categories,
      godowns,
      addProduct: (product) => {
        const created: Product = {
          ...product,
          id: uid('p'),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ products: [created, ...state.products] }))
        toast.success('Product added', `${created.name} was created.`)
        return created
      },
      updateProduct: (id, patch) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        }))
        toast.success('Product updated', 'Changes saved successfully.')
      },
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }))
        toast.success('Product deleted', 'Removed from your catalogue.')
      },
      duplicateProduct: (id) => {
        const source = get().products.find((p) => p.id === id)
        if (!source) return
        const copy: Product = {
          ...source,
          id: uid('p'),
          sku: `${source.sku}-COPY`,
          name: `${source.name} (Copy)`,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ products: [copy, ...state.products] }))
        toast.success('Product duplicated', `${copy.name} created.`)
      },
      adjustStock: (productId, delta) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? { ...p, currentStock: Math.max(0, p.currentStock + delta) }
              : p,
          ),
        }))
      },
      addCategory: (category) => {
        set((state) => ({
          categories: [...state.categories, { ...category, id: uid('cat') }],
        }))
        toast.success('Category added', category.name)
      },
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }))
        toast.success('Category deleted')
      },
      importProducts: (list) => {
        const created = list.map((p, i) => ({
          ...p,
          id: uid('p'),
          createdAt: new Date().toISOString(),
          sku: p.sku || `SKU-${Date.now()}-${i}`,
        }))
        set((state) => ({ products: [...created, ...state.products] }))
        toast.success('Products imported', `${created.length} products added.`)
        return created.length
      },
      exportProducts: () => get().products,
    }),
    { name: 'bizflow:products' },
  ),
)
