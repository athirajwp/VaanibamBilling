import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { InvoicePdfDocument } from '@/components/billing/InvoicePdfDocument'
import type { Invoice, BusinessInfo, InvoiceSettings } from '@/types'

export async function generateInvoicePdfBlob(
  invoice: Invoice,
  business: BusinessInfo,
  invoiceSettings?: InvoiceSettings,
  paperSize: 'a4' | 'thermal' = 'a4',
): Promise<Blob> {
  const element = React.createElement(InvoicePdfDocument, {
    invoice,
    business,
    invoiceSettings,
    paperSize,
  })
  return await pdf(element).toBlob()
}

/**
 * Generates and prints the invoice PDF using the native browser PDF viewer/print dialog.
 */
export async function printInvoicePdf(
  invoice: Invoice,
  business: BusinessInfo,
  invoiceSettings?: InvoiceSettings,
  paperSize: 'a4' | 'thermal' = 'a4',
): Promise<void> {
  const blob = await generateInvoicePdfBlob(invoice, business, invoiceSettings, paperSize)
  const blobUrl = URL.createObjectURL(blob)

  // Open the PDF in a clean window/tab with full browser PDF controls
  const win = window.open(blobUrl, '_blank')
  if (!win) {
    downloadInvoicePdf(invoice, business, invoiceSettings, paperSize)
  }
}

/**
 * Generates and downloads the invoice PDF to the user's computer.
 */
export async function downloadInvoicePdf(
  invoice: Invoice,
  business: BusinessInfo,
  invoiceSettings?: InvoiceSettings,
  paperSize: 'a4' | 'thermal' = 'a4',
): Promise<void> {
  const blob = await generateInvoicePdfBlob(invoice, business, invoiceSettings, paperSize)
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = `Invoice-${invoice.invoiceNumber}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
}
