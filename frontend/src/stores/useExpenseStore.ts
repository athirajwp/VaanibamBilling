import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { expenses, expenseCategories } from '@/mock'
import type { Expense } from '@/types'
import { uid } from '@/lib/utils'
import { toast } from './useToastStore'

interface ExpenseState {
  expenses: Expense[]
  categories: string[]
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void
  updateExpense: (id: string, patch: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  addCategory: (name: string) => void
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      expenses,
      categories: expenseCategories,
      addExpense: (expense) => {
        set((state) => ({
          expenses: [
            { ...expense, id: uid('exp'), createdAt: new Date().toISOString() },
            ...state.expenses,
          ],
        }))
        toast.success('Expense added', `${expense.description} recorded.`)
      },
      updateExpense: (id, patch) => {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
          ),
        }))
        toast.success('Expense updated')
      },
      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }))
        toast.success('Expense deleted')
      },
      addCategory: (name) => {
        if (!name.trim()) return
        set((state) => ({
          categories: state.categories.includes(name.trim())
            ? state.categories
            : [...state.categories, name.trim()],
        }))
        toast.success('Category added', name.trim())
      },
    }),
    { name: 'bizflow:expenses' },
  ),
)

export interface InventoryStats {
  totalStockValue: number
  lowStock: number
  outOfStock: number
  stockIn: number
  stockOut: number
}
