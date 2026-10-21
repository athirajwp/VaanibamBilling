import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultSettings } from '@/mock'
import type { AppSettings, BusinessInfo } from '@/types'

interface BusinessState {
  business: BusinessInfo
  selectedBusinessId: string
  updateBusiness: (business: Partial<BusinessInfo>) => void
  setSelectedBusiness: (id: string) => void
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      business: defaultSettings.business,
      selectedBusinessId: 'default',
      updateBusiness: (patch) =>
        set((state) => ({ business: { ...state.business, ...patch } })),
      setSelectedBusiness: (id) => set({ selectedBusinessId: id }),
    }),
    { name: 'bizflow:business' },
  ),
)

export const useSettingsStore = create<{
  settings: AppSettings
  updateSettings: (patch: Partial<AppSettings>) => void
  updateInvoice: (patch: Partial<AppSettings['invoice']>) => void
  updateOnlineStore: (patch: Partial<AppSettings['onlineStore']>) => void
  saveTaxes: (taxes: AppSettings['taxes']) => void
  saveUsers: (users: AppSettings['users']) => void
  savePrinters: (printers: AppSettings['printers']) => void
}>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      updateInvoice: (patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            invoice: { ...state.settings.invoice, ...patch },
          },
        })),
      updateOnlineStore: (patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            onlineStore: { ...state.settings.onlineStore, ...patch },
          },
        })),
      saveTaxes: (taxes) =>
        set((state) => ({ settings: { ...state.settings, taxes } })),
      saveUsers: (users) =>
        set((state) => ({ settings: { ...state.settings, users } })),
      savePrinters: (printers) =>
        set((state) => ({ settings: { ...state.settings, printers } })),
    }),
    { name: 'bizflow:settings' },
  ),
)
