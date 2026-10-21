import { useMemo, useRef, useState } from 'react'
import { Save, PauseCircle, Printer, MessageCircle, CheckCircle, Plus, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CustomerSelector } from '@/components/billing/CustomerSelector'
import { ProductSearch } from '@/components/billing/ProductSearch'
import { InvoiceItemsTable } from '@/components/billing/InvoiceItemsTable'
import { PaymentModal } from '@/components/billing/PaymentModal'
import { SuccessScreen } from '@/components/billing/SuccessScreen'
import { InvoicePreview } from '@/components/billing/InvoicePreview'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProductStore } from '@/stores/useProductStore'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { toast } from '@/stores/useToastStore'
import type { Invoice, InvoiceItem, Product } from '@/types'
import { computeLine, computeTotals } from '@/lib/billing'
import { formatCurrency } from '@/lib/format'
import { printDocument } from '@/lib/desktop/printer'
import { printInvoicePdf, downloadInvoicePdf } from '@/lib/desktop/pdfPrinter'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function BillingPage() {
  const products = useProductStore((s) => s.products)
  const adjustStock = useProductStore((s) => s.adjustStock)
  const createInvoice = useInvoiceStore((s) => s.createInvoice)
  const business = useBusinessStore((s) => s.business)
  const settings = useSettingsStore((s) => s.settings)

  const [customerId, setCustomerId] = useState('c-001')
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [additionalDiscount, setAdditionalDiscount] = useState(0)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [printOpen, setPrintOpen] = useState(false)
  const [previewTab, setPreviewTab] = useState<'a4' | 'thermal'>('a4')
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null)
  const productSearchKey = useRef(0)

  const nextInvoiceNumber = useMemo(() => {
    const invoices = useInvoiceStore.getState().invoices
    const max = invoices.reduce((m, inv) => {
      const num = Number(inv.invoiceNumber.replace(/\D/g, ''))
      return Math.max(m, Number.isFinite(num) ? num : 0)
    }, 1000)
    return max + 1
  }, [items])

  const totals = useMemo(
    () => computeTotals(items, additionalDiscount),
    [items, additionalDiscount],
  )

  const addProduct = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...computeLine(product, i.qty + 1, i.price, i.discount), id: i.id }
            : i,
        )
      }
      return [...prev, computeLine(product, 1, product.sellingPrice, 0)]
    })
  }

  const updateItem = (id: string, patch: Partial<InvoiceItem>) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const merged = { ...i, ...patch }
        const product = products.find((p) => p.id === i.productId)
        if (!product) return merged
        return computeLine(product, merged.qty, merged.price, merged.discount)
      }),
    )
  }

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const saveDraft = (status: 'draft' | 'held') => {
    if (items.length === 0) {
      toast.warning('No items', 'Add at least one product to save.')
      return
    }
    createInvoice({ customerId, items, ...totals }, status)
    resetSale()
    toast.success(status === 'held' ? 'Sale held' : 'Draft saved', 'You can resume it from invoices.')
  }

  const handleComplete = (method: string, amount: number) => {
    if (items.length === 0) {
      toast.warning('No items', 'Add at least one product to complete the sale.')
      setPaymentOpen(false)
      return
    }
    const invoice = createInvoice(
      { customerId, items, ...totals },
      'completed',
      { method, amount },
    )
    items.forEach((item) => adjustStock(item.productId, -item.qty))
    setPaymentOpen(false)
    setCompletedInvoice(invoice)
  }

  const resetSale = () => {
    setItems([])
    setAdditionalDiscount(0)
    setCustomerId('c-001')
    productSearchKey.current += 1
  }

  const printPreview = async () => {
    if (items.length === 0) {
      toast.warning('Nothing to print', 'Add products to your invoice first.')
      return
    }
    const targetId = previewTab === 'thermal' ? 'billing-preview-thermal' : 'billing-preview-a4'
    const html = document.getElementById(targetId)?.innerHTML ?? '<p>Invoice</p>'
    await printDocument({
      title: `Invoice-${business.invoicePrefix || 'INV'}-${nextInvoiceNumber}`,
      html,
      paperSize: previewTab,
    })
    toast.info('Print preview opened', 'Use your browser print dialog.')
  }

  const handlePrintPdf = async () => {
    if (items.length === 0) {
      toast.warning('Nothing to print', 'Add products to your invoice first.')
      return
    }
    const inv = previewInvoice(customerId, items, totals, business.invoicePrefix, nextInvoiceNumber)
    await printInvoicePdf(inv, business, settings.invoice, previewTab)
    toast.info('PDF generated', 'Opening PDF print preview.')
  }

  const handleDownloadPdf = async () => {
    if (items.length === 0) {
      toast.warning('Nothing to download', 'Add products to your invoice first.')
      return
    }
    const inv = previewInvoice(customerId, items, totals, business.invoicePrefix, nextInvoiceNumber)
    await downloadInvoicePdf(inv, business, settings.invoice, previewTab)
    toast.success('Downloaded', `Invoice ${inv.invoiceNumber}.pdf downloaded.`)
  }

  useKeyboardShortcuts([
    { key: 'F1', handler: () => { resetSale(); toast.info('New sale started') } },
    { key: 'F2', handler: (e) => { e.preventDefault(); document.getElementById('billing-search-input')?.focus() } },
    { key: 'F3', handler: (e) => { e.preventDefault(); document.getElementById('billing-customer-btn')?.querySelector('button')?.focus() } },
    { key: 'F4', handler: (e) => { e.preventDefault(); saveDraft('held') } },
    { key: 'F5', handler: (e) => { e.preventDefault(); setPaymentOpen(true) } },
    { key: 'F6', handler: (e) => { e.preventDefault(); printPreview() } },
    {
      key: 's',
      ctrl: true,
      handler: (e) => { e.preventDefault(); saveDraft('draft') },
    },
  ])

  if (completedInvoice) {
    return (
      <SuccessScreen
        invoice={completedInvoice}
        onNewSale={resetSale}
        onClose={() => setCompletedInvoice(null)}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-card px-5 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">New Invoice</h1>
          <p className="text-xs text-muted-foreground">
            {business.invoicePrefix}-{nextInvoiceNumber} · {formatCurrency(totals.grandTotal)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => saveDraft('draft')}>
                <Save className="h-4 w-4" /> Save Draft
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ctrl+S</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => saveDraft('held')}>
                <PauseCircle className="h-4 w-4" /> Hold
              </Button>
            </TooltipTrigger>
            <TooltipContent>F4</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={printPreview}>
                <Printer className="h-4 w-4" /> Print
              </Button>
            </TooltipTrigger>
            <TooltipContent>F6</TooltipContent>
          </Tooltip>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('WhatsApp', 'Opening WhatsApp to share invoice (demo).')}
          >
            <MessageCircle className="h-4 w-4 text-success" /> WhatsApp
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="success" onClick={() => setPaymentOpen(true)}>
                <CheckCircle className="h-4 w-4" /> Complete Sale
              </Button>
            </TooltipTrigger>
            <TooltipContent>F5</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="shrink-0 text-xs font-medium text-muted-foreground">Customer</Label>
              <div id="billing-customer-btn">
                <CustomerSelector value={customerId} onChange={setCustomerId} />
              </div>
            </div>
          </div>

          <ProductSearch
            key={productSearchKey.current}
            autoFocus
            onSelect={addProduct}
          />

          <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-card shadow-sm">
            <InvoiceItemsTable
              items={items}
              onUpdate={updateItem}
              onRemove={removeItem}
              onSelectProduct={() => document.getElementById('billing-search-input')?.focus()}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-semibold">Summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount</span>
                <Input
                  type="number"
                  min={0}
                  value={additionalDiscount}
                  onChange={(e) => setAdditionalDiscount(Math.max(0, Number(e.target.value) || 0))}
                  className="h-7 w-24 text-right text-sm tabular"
                />
              </div>
              <SummaryRow label="CGST" value={formatCurrency(totals.cgst)} />
              <SummaryRow label="SGST" value={formatCurrency(totals.sgst)} />
              <div className="flex items-center justify-between border-t pt-2 text-base font-bold">
                <span>Grand Total</span>
                <span className="tabular">{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setPrintOpen(true)}>
                <Printer className="h-4 w-4" /> Preview
              </Button>
              <Button variant="success" onClick={() => setPaymentOpen(true)}>
                <CheckCircle className="h-4 w-4" /> Pay
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-semibold">Items</h3>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Line items</span>
              <span className="font-semibold tabular">{items.length}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total quantity</span>
              <span className="font-semibold tabular">
                {items.reduce((s, i) => s + i.qty, 0)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full"
              onClick={() => { resetSale(); toast.info('Cart cleared', 'All items removed.') }}
            >
              <Plus className="h-4 w-4" /> Clear Cart
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">Quick Keys</p>
            <p>F1 New · F2 Search · F3 Customer · F4 Hold · F5 Pay · F6 Print</p>
          </div>
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        grandTotal={totals.grandTotal}
        onComplete={handleComplete}
      />

      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {items.length > 0 ? (
              <Tabs value={previewTab} onValueChange={(val) => setPreviewTab(val as 'a4' | 'thermal')} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="a4" className="flex-1">A4</TabsTrigger>
                  <TabsTrigger value="thermal" className="flex-1">Thermal</TabsTrigger>
                </TabsList>
                <TabsContent value="a4" className="mt-4">
                  <div id="billing-preview-a4" className="w-full flex justify-center">
                    <InvoicePreview
                      invoice={previewInvoice(customerId, items, totals, business.invoicePrefix, nextInvoiceNumber)}
                      business={business}
                      invoiceSettings={settings.invoice}
                      variant="a4"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="thermal" className="mt-4">
                  <div id="billing-preview-thermal" className="w-full flex justify-center">
                    <InvoicePreview
                      invoice={previewInvoice(customerId, items, totals, business.invoicePrefix, nextInvoiceNumber)}
                      business={business}
                      invoiceSettings={settings.invoice}
                      variant="thermal"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Add products to preview your invoice.</p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setPrintOpen(false)}>Close</Button>
            <Button variant="outline" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <Button onClick={handlePrintPdf}>
              <Printer className="h-4 w-4" /> Print Bill (PDF)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular">{value}</span>
    </div>
  )
}

function previewInvoice(
  customerId: string,
  items: InvoiceItem[],
  totals: { subtotal: number; discount: number; cgst: number; sgst: number; igst: number; grandTotal: number },
  prefix: string,
  nextNumber: number,
): Invoice {
  return {
    id: 'preview',
    invoiceNumber: `${prefix}-${nextNumber}`,
    customerId,
    customerName: 'Customer',
    date: new Date().toISOString(),
    items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    cgst: totals.cgst,
    sgst: totals.sgst,
    igst: totals.igst,
    grandTotal: totals.grandTotal,
    amountPaid: 0,
    paymentStatus: 'pending',
    status: 'draft',
    createdAt: new Date().toISOString(),
  }
}
