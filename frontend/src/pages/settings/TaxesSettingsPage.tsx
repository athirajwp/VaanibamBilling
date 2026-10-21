import { useState } from 'react'
import { Wallet, Plus, Save, Trash2, Percent } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/common/Modal'
import { SettingsTabs } from '@/components/settings/SettingsTabs'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { toast } from '@/stores/useToastStore'
import type { TaxSetting } from '@/types'

const taxTypes: { value: TaxSetting['type']; label: string }[] = [
  { value: 'cgst', label: 'CGST' },
  { value: 'sgst', label: 'SGST' },
  { value: 'igst', label: 'IGST' },
  { value: 'custom', label: 'Custom' },
]

export function TaxesSettingsPage() {
  const taxes = useSettingsStore((s) => s.settings.taxes)
  const saveTaxes = useSettingsStore((s) => s.saveTaxes)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<TaxSetting>({ id: '', name: '', rate: 0, type: 'custom', enabled: true })

  const openAdd = () => {
    setForm({ id: `tax-${Date.now()}`, name: '', rate: 0, type: 'custom', enabled: true })
    setModalOpen(true)
  }

  const save = () => {
    if (!form.name.trim()) {
      toast.error('Name required', 'Enter a tax name.')
      return
    }
    saveTaxes([...taxes, form])
    toast.success('Tax added', `${form.name} (${form.rate}%) saved.`)
    setModalOpen(false)
  }

  const toggleEnabled = (id: string) => {
    saveTaxes(taxes.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)))
  }

  const remove = (id: string) => {
    saveTaxes(taxes.filter((t) => t.id !== id))
    toast.success('Tax removed', 'Tax deleted from list.')
  }

  const totalEnabled = taxes.filter((t) => t.enabled).length

  return (
    <div>
      <PageHeader
        title="Taxes"
        description={`${totalEnabled} of ${taxes.length} tax rates enabled`}
        icon={<Wallet className="h-5 w-5" />}
      >
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Tax
        </Button>
      </PageHeader>
      <SettingsTabs />

      <div className="mx-auto max-w-3xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Tax Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {taxes.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                  <Percent className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{t.name}</p>
                    <Badge variant="outline" className="uppercase">{t.type}</Badge>
                    {!t.enabled && <Badge variant="muted">Disabled</Badge>}
                  </div>
                </div>
                <span className="text-sm font-semibold tabular">{t.rate}%</span>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={t.enabled}
                    onChange={() => toggleEnabled(t.id)}
                    className="h-4 w-4 rounded border-input"
                  />
                </label>
                <Button variant="ghost" size="iconSm" onClick={() => remove(t.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {taxes.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No tax rates configured.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Add Tax Rate"
      >
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Tax Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. GST 28%" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Rate (%)</Label>
              <Input
                type="number"
                value={String(form.rate)}
                onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as TaxSetting['type'] })}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {taxTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="tax-enabled"
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="tax-enabled">Enable this tax</Label>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={save}>
            <Save className="h-4 w-4" /> Save
          </Button>
        </div>
      </Modal>
    </div>
  )
}
