import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { customers } from '@/mock'
import type { Customer } from '@/types'
import { uid } from '@/lib/utils'
import { toast } from './useToastStore'

interface CustomerState {
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer
  updateCustomer: (id: string, patch: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      customers,
      addCustomer: (customer) => {
        const created: Customer = {
          ...customer,
          id: uid('c'),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ customers: [created, ...state.customers] }))
        toast.success('Customer added', `${created.name} added successfully.`)
        return created
      },
      updateCustomer: (id, patch) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        }))
        toast.success('Customer updated', 'Changes saved successfully.')
      },
      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }))
        toast.success('Customer deleted', 'Removed from your list.')
      },
    }),
    { name: 'bizflow:customers' },
  ),
)
