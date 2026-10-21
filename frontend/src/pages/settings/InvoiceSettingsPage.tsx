import { useState } from 'react'
import { FileText, Save, Eye } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsTabs } from '@/components/settings/SettingsTabs'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { InvoicePreview } from '@/components/billing/InvoicePreview'
import { useProductStore } from '@/stores/useProductStore'
import { toast } from '@/stores/useToastStore'
import type { Invoice } from '@/types'

export function InvoiceSettingsPage() {
  const settings = useSettingsStore((s) => s.settings)
  const updateInvoice = useSettingsStore((s) => s.updateInvoice)
  const business = useBusinessStore((s) => s.business)
  const products = useProductStore((s) => s.products)

  const [form, setForm] = useState({ ...settings.invoice })

  const save = () => {
    updateInvoice(form)
    toast.success('Invoice settings saved', 'Invoice template updated.')
  }

  const preview: Invoice = {
    id: 'preview',
    invoiceNumber: `${business.invoicePrefix}-1000`,
    customerId: 'c-001',
    customerName: 'Sample Customer',
    date: new Date().toISOString(),
    items: products.slice(0, 3).map((p, i) => ({
      id: `preview-${i}`,
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      qty: 2,
      price: p.sellingPrice,
      discount: 0,
      gstRate: p.gstRate,
      gstAmount: Math.round((2 * p.sellingPrice * p.gstRate) / 100),
      total: 2 * p.sellingPrice + Math.round((2 * p.sellingPrice * p.gstRate) / 100),
    })),
    subtotal: 0,
    discount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    grandTotal: 100,
    amountPaid: 0,
    paymentStatus: 'pending',
    status: 'completed',
    createdAt: new Date().toISOString(),
  }

  return (
    <div>
      <PageHeader
        title="Invoice Settings"
        description="Template, paper and invoice display options"
        icon={<FileText className="h-5 w-5" />}
      >
        <Button size="sm" onClick={save}>
          <Save className="h-4 w-4" /> Save
        </Button>
      </PageHeader>
      <SettingsTabs />

      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Template Style</Label>
              <Select value={form.template} onValueChange={(v) => setForm({ ...form, template: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Paper Size</Label>
              <Select value={form.paperSize} onValueChange={(v) => setForm({ ...form, paperSize: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="a5">A5</SelectItem>
                  <SelectItem value="80mm">80mm Thermal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Footer Text</Label>
              <Textarea
                value={form.footerText}
                onChange={(e) => setForm({ ...form, footerText: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label>Default Payment Terms</Label>
              <Input
                value={form.defaultPaymentTerms}
                onChange={(e) => setForm({ ...form, defaultPaymentTerms: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SwitchRow label="Show Logo" hint="Display your business logo on invoices" checked={form.showLogo} onChange={(v) => setForm({ ...form, showLogo: v })} />
            <SwitchRow label="Show GST Details" hint="Print GSTIN and tax summary" checked={form.showGst} onChange={(v) => setForm({ ...form, showGst: v })} />
            <SwitchRow label="Show Signature" hint="Add a signature line at the bottom" checked={form.showSignature} onChange={(v) => setForm({ ...form, showSignature: v })} />
            <SwitchRow label="Show Bank Details" hint="Print bank account on the invoice" checked={form.showBankDetails} onChange={(v) => setForm({ ...form, showBankDetails: v })} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" /> Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border">
              <InvoicePreview invoice={preview} business={business} invoiceSettings={form} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SwitchRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
