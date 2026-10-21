import { useState } from 'react'
import { Printer, Plus, Save, Check, Plug, PlugZap, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/common/Modal'
import { SettingsTabs } from '@/components/settings/SettingsTabs'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { toast } from '@/stores/useToastStore'
import type { PrinterSetting } from '@/types'

const printerTypes = ['Thermal 80mm', 'A4 Inkjet', 'A4 Laser', 'Dot Matrix', 'POS']

export function PrinterSettingsPage() {
  const printers = useSettingsStore((s) => s.settings.printers)
  const savePrinters = useSettingsStore((s) => s.savePrinters)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<PrinterSetting>({ id: '', name: '', type: 'Thermal 80mm', isDefault: false, connected: true })

  const openAdd = () => {
    setForm({ id: `pr-${Date.now()}`, name: '', type: 'Thermal 80mm', isDefault: printers.length === 0, connected: true })
    setModalOpen(true)
  }

  const save = () => {
    if (!form.name.trim()) {
      toast.error('Name required', 'Enter a printer name.')
      return
    }
    let next = [...printers, form]
    if (form.isDefault) {
      next = next.map((p) => ({ ...p, isDefault: p.id === form.id }))
    }
    savePrinters(next)
    toast.success('Printer added', `${form.name} saved.`)
    setModalOpen(false)
  }

  const setDefault = (id: string) => {
    savePrinters(printers.map((p) => ({ ...p, isDefault: p.id === id })))
    toast.success('Default printer set', 'New receipts will print here.')
  }

  const toggleConnected = (id: string) => {
    savePrinters(printers.map((p) => (p.id === id ? { ...p, connected: !p.connected } : p)))
  }

  const remove = (id: string) => {
    savePrinters(printers.filter((p) => p.id !== id))
    toast.success('Printer removed', 'Printer deleted from list.')
  }

  return (
    <div>
      <PageHeader
        title="Printers"
        description="Configure printers for invoices, receipts and reports"
        icon={<Printer className="h-5 w-5" />}
      >
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Printer
        </Button>
      </PageHeader>
      <SettingsTabs />

      <div className="mx-auto max-w-3xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Configured Printers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {printers.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                  <Printer className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{p.name}</p>
                    {p.isDefault && <Badge variant="primary">Default</Badge>}
                    <Badge variant={p.connected ? 'success' : 'muted'}>
                      {p.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{p.type}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="iconSm" onClick={() => toggleConnected(p.id)} title={p.connected ? 'Disconnect' : 'Connect'}>
                    {p.connected ? <PlugZap className="h-4 w-4 text-success" /> : <Plug className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                  {!p.isDefault && (
                    <Button variant="ghost" size="iconSm" onClick={() => setDefault(p.id)} title="Set as default">
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="iconSm" onClick={() => remove(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {printers.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No printers configured. Add one to start printing.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Add Printer"
      >
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Printer Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Front Desk Thermal" />
          </div>
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {printerTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="printer-default"
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="printer-default">Set as default printer</Label>
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
