import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Invoice, BusinessInfo, InvoiceSettings } from '@/types'
import { formatNumber, formatDate } from '@/lib/format'

interface InvoicePdfDocumentProps {
  invoice: Invoice
  business: BusinessInfo
  invoiceSettings?: InvoiceSettings
  paperSize?: 'a4' | 'thermal'
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  businessTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 3,
  },
  textMuted: {
    color: '#64748b',
    fontSize: 8,
    lineHeight: 1.35,
  },
  invoiceTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    textAlign: 'right',
    marginBottom: 3,
  },
  billToSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  customerName: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  table: {
    width: '100%',
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  colProduct: { width: '42%' },
  colQty: { width: '10%', textAlign: 'right' },
  colRate: { width: '14%', textAlign: 'right' },
  colDiscount: { width: '12%', textAlign: 'right' },
  colGst: { width: '8%', textAlign: 'right' },
  colAmount: { width: '14%', textAlign: 'right' },
  productName: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  productSku: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 1,
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  totalsBox: {
    width: '45%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    fontSize: 8.5,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    paddingTop: 4,
    marginTop: 4,
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 3,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626',
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7.5,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 2,
  },
  signatureSection: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  signatureBox: {
    width: 140,
    borderTopWidth: 1,
    borderTopColor: '#94a3b8',
    borderStyle: 'dashed',
    paddingTop: 4,
    textAlign: 'center',
    fontSize: 7.5,
    color: '#64748b',
  },
})

function formatInr(val: number): string {
  return `Rs. ${formatNumber(val)}`
}

export function InvoicePdfDocument({
  invoice,
  business,
  invoiceSettings,
  paperSize = 'a4',
}: InvoicePdfDocumentProps) {
  const balance = invoice.grandTotal - invoice.amountPaid

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`} author={business.name}>
      <Page size={paperSize === 'thermal' ? [226.77, 600] : 'A4'} style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ maxWidth: '60%' }}>
            <Text style={styles.businessTitle}>{business.name}</Text>
            <Text style={styles.textMuted}>{business.address}</Text>
            {Boolean(invoiceSettings?.showGst && business.gstin) && (
              <Text style={styles.textMuted}>GSTIN: {business.gstin}</Text>
            )}
            <Text style={styles.textMuted}>Phone: {business.phone}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.textMuted}>No: {invoice.invoiceNumber}</Text>
            <Text style={styles.textMuted}>Date: {formatDate(invoice.date)}</Text>
            <Text style={styles.textMuted}>Terms: Due on receipt</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billToSection}>
          <View>
            <Text style={styles.sectionHeading}>BILL TO</Text>
            <Text style={styles.customerName}>{invoice.customerName}</Text>
            <Text style={styles.textMuted}>
              {invoice.customerName === 'Walk-in Customer' ? 'Cash Customer' : 'Credit Customer'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.sectionHeading}>PAYMENT STATUS</Text>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: balance <= 0 ? '#16a34a' : '#d97706' }}>
              {balance <= 0 ? 'PAID' : invoice.amountPaid > 0 ? 'PARTIAL' : 'PENDING'}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colProduct]}>Product</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.colDiscount]}>Discount</Text>
            <Text style={[styles.tableHeaderCell, styles.colGst]}>GST</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.colProduct}>
                <Text style={styles.productName}>{item.productName}</Text>
                {Boolean(item.sku) && <Text style={styles.productSku}>{item.sku}</Text>}
              </View>
              <Text style={[styles.textMuted, styles.colQty]}>{item.qty}</Text>
              <Text style={[styles.textMuted, styles.colRate]}>{formatInr(item.price)}</Text>
              <Text style={[styles.textMuted, styles.colDiscount]}>
                {item.discount > 0 ? formatInr(item.discount) : '—'}
              </Text>
              <Text style={[styles.textMuted, styles.colGst]}>{item.gstRate}%</Text>
              <Text style={[{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#1e293b' }, styles.colAmount]}>
                {formatInr(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals Summary */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.textMuted}>Subtotal</Text>
              <Text style={{ fontSize: 8.5 }}>{formatInr(invoice.subtotal)}</Text>
            </View>
            {invoice.discount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.textMuted}>Discount</Text>
                <Text style={{ fontSize: 8.5, color: '#dc2626' }}>- {formatInr(invoice.discount)}</Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text style={styles.textMuted}>CGST</Text>
              <Text style={{ fontSize: 8.5 }}>{formatInr(invoice.cgst)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.textMuted}>SGST</Text>
              <Text style={{ fontSize: 8.5 }}>{formatInr(invoice.sgst)}</Text>
            </View>
            {invoice.igst > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.textMuted}>IGST</Text>
                <Text style={{ fontSize: 8.5 }}>{formatInr(invoice.igst)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text>Grand Total</Text>
              <Text>{formatInr(invoice.grandTotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.textMuted}>Amount Paid</Text>
              <Text style={{ fontSize: 8.5 }}>{formatInr(invoice.amountPaid)}</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text>Balance Due</Text>
              <Text>{formatInr(Math.max(0, balance))}</Text>
            </View>
          </View>
        </View>

        {/* Signature */}
        {Boolean(invoiceSettings?.showSignature !== false) && (
          <View style={styles.signatureSection}>
            <Text style={styles.signatureBox}>Authorised Signature</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {Boolean(invoiceSettings?.footerText) && (
            <Text style={styles.footerText}>{invoiceSettings?.footerText}</Text>
          )}
          <Text style={styles.footerText}>
            Thank you for your business! · Goods once sold will not be taken back
          </Text>
        </View>
      </Page>
    </Document>
  )
}
