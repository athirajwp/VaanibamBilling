import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Share2, Pencil, Copy, XCircle, Banknote, MessageCircle, Download } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InvoicePreview } from '@/components/billing/InvoicePreview'
import { PaymentModal } from '@/components/billing/PaymentModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DocumentStatusBadge, PaymentStatusBadge } from '@/components/common/StatusBadge'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { formatCurrency, formatDate } from '@/lib/format'
import { printInvoicePdf, downloadInvoicePdf } from '@/lib/desktop/pdfPrinter'
import { toast } from '@/stores/useToastStore'
import { PageNotFound } from '@/components/common/PageNotFound'

export function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const invoices = useInvoiceStore((s) => s.invoices)
  const recordPayment = useInvoiceStore((s) => s.recordPayment)
  const cancelInvoice = useInvoiceStore((s) => s.cancelInvoice)
  const duplicateInvoice = useInvoiceStore((s) => s.duplicateInvoice)
  const business = useBusinessStore((s) => s.business)
  const settings = useSettingsStore((s) => s.settings)

  const invoice = invoices.find((i) => i.id === id)
  const [payOpen, setPayOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  if (!invoice) return <PageNotFound />

  const handlePrint = async () => {
    await printInvoicePdf(invoice, business, settings.invoice)
    toast.info('Printing', `${invoice.invoiceNumber} PDF opened for printing.`)
  }

  const handleDownload = async () => {
    await downloadInvoicePdf(invoice, business, settings.invoice)
    toast.success('Downloaded', `Invoice ${invoice.invoiceNumber}.pdf downloaded.`)
  }

  const balance = invoice.grandTotal - invoice.amountPaid

  return (
    <div>
      <PageHeader
        title={invoice.invoiceNumber}
        description={`${formatDate(invoice.date)} · ${invoice.customerName}`}
        icon={<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{invoice.invoiceNumber.slice(-3)}</div>}
      >
        <div className="flex items-center gap-1.5">
          <PaymentStatusBadge status={invoice.paymentStatus} />
          <DocumentStatusBadge status={invoice.status} />
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={() => duplicateInvoice(invoice.id)}>
          <Copy className="h-4 w-4" /> Duplicate
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4" /> Download PDF
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Print Bill (PDF)
        </Button>
        {invoice.status !== 'cancelled' && balance > 0 && (
          <Button size="sm" onClick={() => setPayOpen(true)}>
            <Banknote className="h-4 w-4" /> Record Payment
          </Button>
        )}
        {invoice.status !== 'cancelled' && (
          <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}>
            <XCircle className="h-4 w-4" /> Cancel
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 p-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="a4">
            <TabsList>
              <TabsTrigger value="a4">A4 Invoice</TabsTrigger>
              <TabsTrigger value="thermal">Thermal Receipt</TabsTrigger>
            </TabsList>
            <TabsContent value="a4">
              <div id="invoice-print-area">
                <InvoicePreview invoice={invoice} business={business} invoiceSettings={settings.invoice} />
              </div>
            </TabsContent>
            <TabsContent value="thermal">
              <div className="flex justify-center">
                <InvoicePreview invoice={invoice} business={business} invoiceSettings={settings.invoice} variant="thermal" />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-semibold">Payment Summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Grand Total" value={formatCurrency(invoice.grandTotal)} bold />
              <Row label="Amount Paid" value={formatCurrency(invoice.amountPaid)} />
              <Row
                label="Balance Due"
                value={formatCurrency(Math.max(0, balance))}
                accent={balance > 0 ? 'text-destructive' : 'text-success'}
              />
              {invoice.paymentMethod && (
                <Row label="Method" value={<span className="capitalize">{invoice.paymentMethod}</span>} />
              )}
              <Row label="Items" value={String(invoice.items.length)} />
            </div>
            <Button
              variant="success"
              className="mt-4 w-full"
              disabled={invoice.status === 'cancelled' || balance <= 0}
              onClick={() => setPayOpen(true)}
            >
              <Banknote className="h-4 w-4" /> Collect Payment
            </Button>
            <Button variant="outline" className="mt-2 w-full" onClick={() => navigate('/billing')}>
              <Pencil className="h-4 w-4" /> Edit / New Similar
            </Button>
          </div>

          <div className="rounded-lg border bg-card p-4 text-xs leading-relaxed text-muted-foreground shadow-sm">
            <p className="text-sm font-semibold text-foreground">Customer</p>
            <p className="mt-1 font-medium text-foreground">{invoice.customerName}</p>
            <p>Walk-in & credit sales supported.</p>
            <div className="mt-3 flex items-center gap-2">
              <Share2 className="h-3.5 w-3.5" />
              <Button variant="link" size="sm" className="h-auto p-0" onClick={() => toast.info('Share', 'Share link copied (demo).')}>
                Share invoice link
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        open={payOpen}
        onOpenChange={setPayOpen}
        grandTotal={balance}
        onComplete={(method, amount) => {
          recordPayment(invoice.id, amount, method)
          setPayOpen(false)
        }}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this invoice?"
        description={`${invoice.invoiceNumber} will be marked as cancelled.`}
        confirmLabel="Cancel Invoice"
        onConfirm={() => cancelInvoice(invoice.id)}
      />
    </div>
  )
}

function Row({ label, value, bold, accent }: { label: string; value: React.ReactNode; bold?: boolean; accent?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? 'font-bold' : 'font-medium'} tabular ${accent ?? ''}`}>{value}</span>
    </div>
  )
}
