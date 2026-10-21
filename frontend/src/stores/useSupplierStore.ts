import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { suppliers } from '@/mock'
import type { Supplier } from '@/types'
import { uid } from '@/lib/utils'
import { toast } from './useToastStore'

interface SupplierState {
  suppliers: Supplier[]
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Supplier
  updateSupplier: (id: string, patch: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
}

export const useSupplierStore = create<SupplierState>()(
  persist(
    (set) => ({
      suppliers,
      addSupplier: (supplier) => {
        const created: Supplier = {
          ...supplier,
          id: uid('s'),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ suppliers: [created, ...state.suppliers] }))
        toast.success('Supplier added', `${created.name} added successfully.`)
        return created
      },
      updateSupplier: (id, patch) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        }))
        toast.success('Supplier updated', 'Changes saved successfully.')
      },
      deleteSupplier: (id) => {
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
        }))
        toast.success('Supplier deleted', 'Removed from your list.')
      },
    }),
    { name: 'bizflow:suppliers' },
  ),
)
