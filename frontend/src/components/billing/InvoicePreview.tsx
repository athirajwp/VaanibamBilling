import type { Invoice, BusinessInfo, InvoiceSettings } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Store } from 'lucide-react'

interface InvoicePreviewProps {
  invoice: Invoice
  business: BusinessInfo
  invoiceSettings: InvoiceSettings
  variant?: 'a4' | 'thermal'
}

export function InvoicePreview({ invoice, business, invoiceSettings, variant = 'a4' }: InvoicePreviewProps) {
  if (variant === 'thermal') {
    return <ThermalPreview invoice={invoice} business={business} invoiceSettings={invoiceSettings} />
  }
  return <A4Preview invoice={invoice} business={business} invoiceSettings={invoiceSettings} />
}

function A4Preview({ invoice, business, invoiceSettings }: Omit<InvoicePreviewProps, 'variant'>) {
  const items = invoice.items
  const balance = invoice.grandTotal - invoice.amountPaid

  return (
    <div className="mx-auto max-w-[700px] rounded-lg border bg-white p-8 text-foreground shadow-sm">
      <div className="flex items-start justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">{business.name}</h2>
            <p className="text-xs text-muted-foreground">{business.address}</p>
            {invoiceSettings.showGst && business.gstin && (
              <p className="mt-0.5 text-xs font-medium">GSTIN: {business.gstin}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">INVOICE</p>
          <p className="text-xs text-muted-foreground">No: {invoice.invoiceNumber}</p>
          <p className="text-xs text-muted-foreground">Date: {formatDate(invoice.date)}</p>
        </div>
      </div>

      <div className="flex justify-between gap-4 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bill To</p>
          <p className="text-sm font-semibold">{invoice.customerName}</p>
          <p className="text-xs text-muted-foreground">
            {invoice.customerName === 'Walk-in Customer' ? 'Cash Customer' : 'Credit customer'}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>Phone: {business.phone}</p>
          <p>Email: {business.email}</p>
          <p>Terms: Due on receipt</p>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-y bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-2">Product</th>
            <th className="w-16 px-2 py-2 text-right">Qty</th>
            <th className="w-24 px-2 py-2 text-right">Rate</th>
            <th className="w-24 px-2 py-2 text-right">Discount</th>
            <th className="w-16 px-2 py-2 text-right">GST</th>
            <th className="w-28 px-2 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="px-2 py-2">
                <p className="font-medium">{item.productName}</p>
                <p className="text-[11px] text-muted-foreground">{item.sku}</p>
              </td>
              <td className="px-2 py-2 text-right tabular">{item.qty}</td>
              <td className="px-2 py-2 text-right tabular">{formatCurrency(item.price)}</td>
              <td className="px-2 py-2 text-right tabular">
                {item.discount ? formatCurrency(item.discount) : '—'}
              </td>
              <td className="px-2 py-2 text-right text-xs">{item.gstRate}%</td>
              <td className="px-2 py-2 text-right font-medium tabular">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-64 space-y-1 text-sm">
          <Row label="Subtotal" value={formatCurrency(invoice.subtotal)} />
          {invoice.discount > 0 && <Row label="Discount" value={`− ${formatCurrency(invoice.discount)}`} negative />}
          <Row label="CGST" value={formatCurrency(invoice.cgst)} />
          <Row label="SGST" value={formatCurrency(invoice.sgst)} />
          {invoice.igst > 0 && <Row label="IGST" value={formatCurrency(invoice.igst)} />}
          <div className="flex items-center justify-between border-t pt-2 text-base font-bold">
            <span>Grand Total</span>
            <span className="tabular">{formatCurrency(invoice.grandTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Amount Paid</span>
            <span className="tabular">{formatCurrency(invoice.amountPaid)}</span>
          </div>
          <div className={cn('flex items-center justify-between text-sm font-semibold', balance > 0 ? 'text-destructive' : 'text-success')}>
            <span>Balance Due</span>
            <span className="tabular">{formatCurrency(Math.max(0, balance))}</span>
          </div>
        </div>
      </div>

      {invoiceSettings.footerText && (
        <div className="mt-8 border-t pt-3 text-center text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{invoiceSettings.footerText}</p>
          <p className="mt-1">Goods once sold will not be taken back · Subject to Sivakasi jurisdiction</p>
          {invoiceSettings.showSignature && (
            <div className="mt-8 flex justify-end text-xs text-muted-foreground">
              <div className="text-center">
                <div className="h-10" />
                <div className="border-t border-dotted border-muted-foreground/50 px-6 pt-1">Authorised Signature</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ThermalPreview({ invoice, business }: Omit<InvoicePreviewProps, 'variant'>) {
  return (
    <div className="mx-auto max-w-[300px] rounded bg-white p-4 font-mono text-[11px] leading-tight text-foreground shadow-sm">
      <div className="text-center">
        <p className="text-sm font-bold">{business.name}</p>
        <p className="mt-0.5">{business.address}</p>
        <p>GSTIN: {business.gstin}</p>
        <p>Ph: {business.phone}</p>
        <p className="mt-1">Invoice: {invoice.invoiceNumber}</p>
        <p>Date: {formatDate(invoice.date)}</p>
        <div className="my-1 border-t border-dashed border-foreground/40" />
        <p>Customer: {invoice.customerName}</p>
      </div>
      <div className="my-1 border-t border-dashed border-foreground/40" />
      <div>
        {invoice.items.map((item) => (
          <div key={item.id} className="mb-1">
            <p>{item.productName}</p>
            <p className="text-right">
              {item.qty} × {formatCurrency(item.price)}
              {item.discount ? ` - ${formatCurrency(item.discount)}` : ''}
            </p>
            <p className="text-right font-bold">{formatCurrency(item.total)}</p>
          </div>
        ))}
      </div>
      <div className="my-1 border-t border-dashed border-foreground/40" />
      <div className="space-y-0.5">
        <p className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></p>
        {invoice.discount > 0 && (
          <p className="flex justify-between"><span>Discount</span><span>{formatCurrency(invoice.discount)}</span></p>
        )}
        <p className="flex justify-between"><span>CGST</span><span>{formatCurrency(invoice.cgst)}</span></p>
        <p className="flex justify-between"><span>SGST</span><span>{formatCurrency(invoice.sgst)}</span></p>
        <p className="flex justify-between text-sm font-bold"><span>GRAND TOTAL</span><span>{formatCurrency(invoice.grandTotal)}</span></p>
        <p className="flex justify-between"><span>Paid</span><span>{formatCurrency(invoice.amountPaid)}</span></p>
        <p className="flex justify-between"><span>Balance</span><span>{formatCurrency(Math.max(0, invoice.grandTotal - invoice.amountPaid))}</span></p>
      </div>
      <div className="my-2 border-t border-dashed border-foreground/40" />
      <p className="text-center">*** {business.invoicePrefix} {invoice.invoiceNumber} ***</p>
      <p className="text-center">Thank you for your business!</p>
    </div>
  )
}

function Row({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className={cn('tabular', negative && 'text-destructive')}>{value}</span>
    </div>
  )
}
