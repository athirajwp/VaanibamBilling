import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, IndianRupee, Wallet, CheckCircle2, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/common/DataTable'
import { PaymentStatusBadge, DocumentStatusBadge } from '@/components/common/StatusBadge'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import { EmptyState } from '@/components/common/EmptyState'
import type { Invoice } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { PageNotFound } from '@/components/common/PageNotFound'

export function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const customers = useCustomerStore((s) => s.customers)
  const invoices = useInvoiceStore((s) => s.invoices)

  const customer = customers.find((c) => c.id === id)

  const data = useMemo(() => {
    if (!customer) return null
    const list = invoices
      .filter((i) => i.customerId === customer.id && i.status !== 'cancelled')
      .sort((a, b) => b.date.localeCompare(a.date))
    const total = list.reduce((s, i) => s + i.grandTotal, 0)
    const paid = list.reduce((s, i) => s + i.amountPaid, 0)
    const outstanding = total - paid + (customer.openingBalance ?? 0)
    return { list, total, paid, outstanding }
  }, [customer, invoices])

  if (!customer || !data) return <PageNotFound />

  return (
    <div>
      <PageHeader
        title={customer.name}
        description="Customer profile"
        icon={<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{customer.name.slice(0, 1)}</div>}
      >
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <CustomerForm
          customer={customer}
          triggerLabel={
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          }
        />
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 p-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={customer.phone || '—'} />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={customer.email || '—'} />
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Address" value={customer.address || '—'} />
            <InfoRow label="GSTIN" value={customer.gstin || '—'} />
            <InfoRow label="Credit Limit" value={formatCurrency(customer.creditLimit ?? 0)} />
            <InfoRow label="Opening Balance" value={formatCurrency(customer.openingBalance ?? 0)} />
            <div className="flex justify-between border-t pt-3">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={customer.status === 'active' ? 'success' : 'muted'}>{customer.status}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="Total Sales" value={formatCurrency(data.total)} icon={<IndianRupee className="h-4 w-4" />} />
            <StatCard title="Total Paid" value={formatCurrency(data.paid)} icon={<CheckCircle2 className="h-4 w-4" />} iconClassName="bg-success/10 text-success" />
            <StatCard title="Outstanding" value={formatCurrency(data.outstanding)} icon={<Wallet className="h-4 w-4" />} iconClassName={data.outstanding > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'} />
          </div>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="ledger">Ledger</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardContent className="pt-4">
                  <LedgerTable invoices={data.list} onRowClick={(i) => navigate(`/sales/invoices/${i.id}`)} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices">
              <Card>
                <CardContent className="pt-4">
                  {data.list.length === 0 ? (
                    <EmptyState title="No invoices yet" description="Invoices for this customer will appear here." />
                  ) : (
                    <DataTable
                      columns={invoiceColumns}
                      data={data.list}
                      keyField={(i) => i.id}
                      onRowClick={(i) => navigate(`/sales/invoices/${i.id}`)}
                      stickyHeader={false}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardContent className="pt-4">
                  {data.list.filter((i) => i.amountPaid > 0).length === 0 ? (
                    <EmptyState title="No payments recorded" />
                  ) : (
                    <DataTable
                      columns={paymentColumns}
                      data={data.list.filter((i) => i.amountPaid > 0)}
                      keyField={(i) => i.id}
                      stickyHeader={false}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ledger">
              <Card>
                <CardContent className="pt-4">
                  <LedgerTable invoices={data.list} onRowClick={(i) => navigate(`/sales/invoices/${i.id}`)} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="max-w-[60%] truncate text-right font-medium">{value}</span>
    </div>
  )
}

const invoiceColumns: Column<Invoice>[] = [
  { key: 'inv', header: 'Invoice #', render: (i) => <span className="font-medium">{i.invoiceNumber}</span> },
  { key: 'date', header: 'Date', render: (i) => <span className="text-muted-foreground">{formatDate(i.date)}</span> },
  { key: 'amount', header: 'Amount', className: 'text-right', render: (i) => <span className="font-semibold tabular">{formatCurrency(i.grandTotal)}</span> },
  { key: 'paid', header: 'Paid', className: 'text-right', render: (i) => <span className="tabular text-muted-foreground">{formatCurrency(i.amountPaid)}</span> },
  { key: 'balance', header: 'Balance', className: 'text-right', render: (i) => <span className="tabular font-medium">{formatCurrency(Math.max(0, i.grandTotal - i.amountPaid))}</span> },
  { key: 'status', header: 'Status', render: (i) => <PaymentStatusBadge status={i.paymentStatus} /> },
]

const paymentColumns: Column<Invoice>[] = [
  { key: 'inv', header: 'Invoice #', render: (i) => <span className="font-medium">{i.invoiceNumber}</span> },
  { key: 'date', header: 'Date', render: (i) => <span className="text-muted-foreground">{formatDate(i.date)}</span> },
  { key: 'method', header: 'Method', render: (i) => <span className="capitalize">{i.paymentMethod ?? '—'}</span> },
  { key: 'paid', header: 'Amount Paid', className: 'text-right', render: (i) => <span className="font-semibold tabular text-success">{formatCurrency(i.amountPaid)}</span> },
  { key: 'status', header: 'Status', render: (i) => <DocumentStatusBadge status={i.status} /> },
]

function LedgerTable({ invoices, onRowClick }: { invoices: Invoice[]; onRowClick: (i: Invoice) => void }) {
  if (invoices.length === 0) {
    return <EmptyState title="No transactions" description="Ledger entries will appear here once you sell to this customer." />
  }
  let running = 0
  const rows = invoices.map((i) => {
    running += i.grandTotal - i.amountPaid
    return { inv: i, balance: running }
  })
  return (
    <DataTable
      columns={[
        { key: 'inv', header: 'Invoice', render: ({ inv }) => <span className="font-medium">{inv.invoiceNumber}</span> },
        { key: 'date', header: 'Date', render: ({ inv }) => <span className="text-muted-foreground">{formatDate(inv.date)}</span> },
        { key: 'debit', header: 'Sales', className: 'text-right', render: ({ inv }) => <span className="tabular">{formatCurrency(inv.grandTotal)}</span> },
        { key: 'credit', header: 'Paid', className: 'text-right', render: ({ inv }) => <span className="tabular text-success">{formatCurrency(inv.amountPaid)}</span> },
        { key: 'balance', header: 'Balance', className: 'text-right', render: ({ balance }) => <span className="font-semibold tabular">{formatCurrency(balance)}</span> },
      ]}
      data={rows}
      keyField={(r) => r.inv.id}
      onRowClick={(r) => onRowClick(r.inv)}
      stickyHeader={false}
    />
  )
}
