import { useState } from 'react'
import { Save, Building2, Phone, Mail, MapPin, FileText, Coins } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsTabs } from '@/components/settings/SettingsTabs'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { toast } from '@/stores/useToastStore'

export function BusinessSettingsPage() {
  const business = useBusinessStore((s) => s.business)
  const updateBusiness = useBusinessStore((s) => s.updateBusiness)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const [form, setForm] = useState({ ...business })

  const save = () => {
    updateBusiness(form)
    updateSettings({ business: form })
    toast.success('Business saved', `${form.name} details updated.`)
  }

  return (
    <div>
      <PageHeader
        title="Business Settings"
        description="Company details shown on invoices and reports"
        icon={<Building2 className="h-5 w-5" />}
      >
        <Button size="sm" onClick={save}>
          <Save className="h-4 w-4" /> Save
        </Button>
      </PageHeader>
      <SettingsTabs />

      <div className="mx-auto max-w-2xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Business Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> GSTIN</Label>
              <Input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Invoice Prefix</Label>
                <Input value={form.invoicePrefix} onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-1.5"><Coins className="h-3.5 w-3.5" /> Currency</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Industry</Label>
              <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
