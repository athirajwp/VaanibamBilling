import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Banknote, XCircle, FileText } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { PaymentStatusBadge, DocumentStatusBadge } from '@/components/common/StatusBadge'
import { PaymentModal } from '@/components/billing/PaymentModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { usePurchaseStore } from '@/stores/usePurchaseStore'
import { formatCurrency, formatDate } from '@/lib/format'
import { printDocument } from '@/lib/desktop/printer'
import { toast } from '@/stores/useToastStore'
import { PageNotFound } from '@/components/common/PageNotFound'

export function PurchaseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const purchases = usePurchaseStore((s) => s.purchases)
  const recordPayment = usePurchaseStore((s) => s.recordPayment)
  const cancelPurchase = usePurchaseStore((s) => s.cancelPurchase)

  const purchase = purchases.find((p) => p.id === id)
  const [payOpen, setPayOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  if (!purchase) return <PageNotFound />

  const balance = purchase.grandTotal - purchase.amountPaid

  const handlePrint = async () => {
    await printDocument({
      title: purchase.billNumber,
      html: document.getElementById('purchase-print-area')?.innerHTML ?? '<p>Purchase Bill</p>',
      paperSize: 'a4',
    })
    toast.info('Printing', `${purchase.billNumber} sent to printer.`)
  }

  return (
    <div>
      <PageHeader
        title={purchase.billNumber}
        description={`${formatDate(purchase.date)} · ${purchase.supplierName}`}
        icon={<FileText className="h-5 w-5" />}
      >
        <div className="flex items-center gap-1.5">
          <PaymentStatusBadge status={purchase.paymentStatus} />
          <DocumentStatusBadge status={purchase.status} />
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Print
        </Button>
        {purchase.status !== 'cancelled' && balance > 0 && (
          <Button size="sm" onClick={() => setPayOpen(true)}>
            <Banknote className="h-4 w-4" /> Record Payment
          </Button>
        )}
        {purchase.status !== 'cancelled' && (
          <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}>
            <XCircle className="h-4 w-4" /> Cancel
          </Button>
        )}
      </PageHeader>

      <div className="mx-auto max-w-3xl p-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm" id="purchase-print-area">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b pb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Purchase Bill</p>
              <p className="text-lg font-bold">{purchase.billNumber}</p>
              <p className="text-sm text-muted-foreground">{formatDate(purchase.date)}</p>
              {purchase.supplierInvoiceNumber && (
                <p className="text-xs text-muted-foreground">Supplier ref: {purchase.supplierInvoiceNumber}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Supplier</p>
              <p className="font-medium">{purchase.supplierName}</p>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2">Product</th>
                <th className="w-16 px-2 py-2 text-right">Qty</th>
                <th className="w-24 px-2 py-2 text-right">Rate</th>
                <th className="w-16 px-2 py-2 text-right">GST</th>
                <th className="w-28 px-2 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((it) => (
                <tr key={it.id} className="border-b">
                  <td className="px-2 py-2">
                    <p className="font-medium">{it.productName}</p>
                    <p className="text-[11px] text-muted-foreground">{it.sku}</p>
                  </td>
                  <td className="px-2 py-2 text-right tabular">{it.qty}</td>
                  <td className="px-2 py-2 text-right tabular">{formatCurrency(it.price)}</td>
                  <td className="px-2 py-2 text-right text-xs">{it.gstRate}%</td>
                  <td className="px-2 py-2 text-right font-medium tabular">{formatCurrency(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto mt-3 w-56 space-y-1 text-sm">
            <Row label="Subtotal" value={formatCurrency(purchase.subtotal)} />
            <Row label="Discount" value={`− ${formatCurrency(purchase.discount)}`} />
            <Row label="GST" value={formatCurrency(purchase.cgst + purchase.sgst)} />
            <div className="flex justify-between border-t pt-1 text-base font-bold">
              <span>Total</span>
              <span className="tabular">{formatCurrency(purchase.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Paid</span>
              <span className="tabular text-success">{formatCurrency(purchase.amountPaid)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Balance</span>
              <span className="tabular text-warning">{formatCurrency(Math.max(0, balance))}</span>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        open={payOpen}
        onOpenChange={setPayOpen}
        grandTotal={balance}
        onComplete={(method, amount) => {
          recordPayment(purchase.id, amount, method)
          setPayOpen(false)
        }}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this purchase bill?"
        description={`${purchase.billNumber} will be marked as cancelled.`}
        confirmLabel="Cancel Bill"
        onConfirm={() => cancelPurchase(purchase.id)}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="tabular text-foreground">{value}</span>
    </div>
  )
}
