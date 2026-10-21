import { CheckCircle2, Printer, Share2, Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import type { Invoice } from '@/types'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { InvoicePreview } from './InvoicePreview'
import { printDocument } from '@/lib/desktop/printer'
import { printInvoicePdf, downloadInvoicePdf } from '@/lib/desktop/pdfPrinter'
import { toast } from '@/stores/useToastStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SuccessScreenProps {
  invoice: Invoice
  onNewSale: () => void
  onClose: () => void
}

export function SuccessScreen({ invoice, onNewSale, onClose }: SuccessScreenProps) {
  const business = useBusinessStore((s) => s.business)
  const settings = useSettingsStore((s) => s.settings)

  const handlePrint = async () => {
    await printInvoicePdf(invoice, business, settings.invoice)
    toast.info('Printing', 'Invoice PDF sent to printer.')
  }

  const handleDownload = async () => {
    await downloadInvoicePdf(invoice, business, settings.invoice)
    toast.success('Downloaded', `Invoice ${invoice.invoiceNumber}.pdf downloaded.`)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="no-print mx-auto mt-8 flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="h-9 w-9 text-success" />
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight">Sale Completed</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {invoice.invoiceNumber} · {formatCurrency(invoice.grandTotal)}
        </p>
      </div>

      <div className="no-print mx-auto mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Print Bill (PDF)
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4" /> Download PDF
        </Button>
        <Button variant="outline" onClick={() => toast.info('Share', 'Sharing link copied (demo).')}>
          <Share2 className="h-4 w-4" /> Share
        </Button>
        <Button variant="success" onClick={onNewSale}>
          <Plus className="h-4 w-4" /> New Sale
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="mt-6 flex flex-1 items-start justify-center gap-4 pb-8 no-print">
        <div className="w-full max-w-[720px]">
          <Tabs defaultValue="a4" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="a4" className="flex-1">A4 Preview</TabsTrigger>
              <TabsTrigger value="thermal" className="flex-1">Thermal Receipt</TabsTrigger>
            </TabsList>
            <TabsContent value="a4">
              <InvoicePreview invoice={invoice} business={business} invoiceSettings={settings.invoice} />
            </TabsContent>
            <TabsContent value="thermal">
              <div className="flex justify-center">
                <InvoicePreview invoice={invoice} business={business} invoiceSettings={settings.invoice} variant="thermal" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div id="print-root" className="print-area hidden">
        <InvoicePreview invoice={invoice} business={business} invoiceSettings={settings.invoice} />
      </div>
    </div>
  )
}
