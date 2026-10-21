import { create } from 'zustand'
import type { ToastMessage, ToastVariant } from '@/types'
import { uid } from '@/lib/utils'

interface ToastState {
  toasts: ToastMessage[]
  push: (title: string, description?: string, variant?: ToastVariant) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (title, description, variant = 'info') =>
    set((state) => ({
      toasts: [...state.toasts, { id: uid('toast'), title, description, variant }],
    })),
  success: (title, description) =>
    set((state) => ({
      toasts: [...state.toasts, { id: uid('toast'), title, description, variant: 'success' }],
    })),
  error: (title, description) =>
    set((state) => ({
      toasts: [...state.toasts, { id: uid('toast'), title, description, variant: 'error' }],
    })),
  info: (title, description) =>
    set((state) => ({
      toasts: [...state.toasts, { id: uid('toast'), title, description, variant: 'info' }],
    })),
  warning: (title, description) =>
    set((state) => ({
      toasts: [...state.toasts, { id: uid('toast'), title, description, variant: 'warning' }],
    })),
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().success(title, description),
  error: (title: string, description?: string) =>
    useToastStore.getState().error(title, description),
  info: (title: string, description?: string) =>
    useToastStore.getState().info(title, description),
  warning: (title: string, description?: string) =>
    useToastStore.getState().warning(title, description),
}
