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
import { PaymentStatusBadge } from '@/components/common/StatusBadge'
import { SupplierForm } from '@/components/suppliers/SupplierForm'
import { EmptyState } from '@/components/common/EmptyState'
import { PageNotFound } from '@/components/common/PageNotFound'
import { useSupplierStore } from '@/stores/useSupplierStore'
import { usePurchaseStore } from '@/stores/usePurchaseStore'
import type { Purchase } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'

export function SupplierDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const suppliers = useSupplierStore((s) => s.suppliers)
  const purchases = usePurchaseStore((s) => s.purchases)
  const supplier = suppliers.find((s) => s.id === id)

  const data = useMemo(() => {
    if (!supplier) return null
    const list = purchases
      .filter((p) => p.supplierId === supplier.id && p.status !== 'cancelled')
      .sort((a, b) => b.date.localeCompare(a.date))
    const total = list.reduce((s, p) => s + p.grandTotal, 0)
    const paid = list.reduce((s, p) => s + p.amountPaid, 0)
    return { list, total, paid, due: total - paid + (supplier.openingBalance ?? 0) }
  }, [supplier, purchases])

  if (!supplier || !data) return <PageNotFound />

  return (
    <div>
      <PageHeader
        title={supplier.name}
        description="Supplier profile"
        icon={<div className="flex h-8 w-8 items-center justify-center rounded-full bg-info/10 text-sm font-bold text-info">{supplier.name.slice(0, 1)}</div>}
      >
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <SupplierForm
          supplier={supplier}
          triggerLabel={
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          }
        />
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 p-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={supplier.phone || '—'} />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={supplier.email || '—'} />
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Address" value={supplier.address || '—'} />
            <InfoRow label="GSTIN" value={supplier.gstin || '—'} />
            <InfoRow label="Opening Balance" value={formatCurrency(supplier.openingBalance ?? 0)} />
            <div className="flex justify-between border-t pt-3">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={supplier.status === 'active' ? 'success' : 'muted'}>{supplier.status}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="Purchases" value={formatCurrency(data.total)} icon={<IndianRupee className="h-4 w-4" />} />
            <StatCard title="Payments" value={formatCurrency(data.paid)} icon={<CheckCircle2 className="h-4 w-4" />} iconClassName="bg-success/10 text-success" />
            <StatCard title="Amount Due" value={formatCurrency(data.due)} icon={<Wallet className="h-4 w-4" />} iconClassName={data.due > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'} />
          </div>

          <Tabs defaultValue="bills" className="mt-4">
            <TabsList>
              <TabsTrigger value="bills">Purchase Bills</TabsTrigger>
              <TabsTrigger value="ledger">Ledger</TabsTrigger>
            </TabsList>
            <TabsContent value="bills">
              <Card>
                <CardContent className="pt-4">
                  {data.list.length === 0 ? (
                    <EmptyState title="No purchases yet" description="Purchase bills from this supplier will appear here." />
                  ) : (
                    <DataTable
                      columns={billsColumns}
                      data={data.list}
                      keyField={(p) => p.id}
                      onRowClick={(p) => navigate(`/purchases/bills/${p.id}`)}
                      stickyHeader={false}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ledger">
              <Card>
                <CardContent className="pt-4">
                  <SupplierLedger purchases={data.list} />
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

const billsColumns: Column<Purchase>[] = [
  { key: 'bill', header: 'Bill #', render: (p) => <span className="font-medium">{p.billNumber}</span> },
  { key: 'date', header: 'Date', render: (p) => <span className="text-muted-foreground">{formatDate(p.date)}</span> },
  { key: 'items', header: 'Items', className: 'text-center', render: (p) => <span>{p.items.length}</span> },
  { key: 'amount', header: 'Amount', className: 'text-right', render: (p) => <span className="font-semibold tabular">{formatCurrency(p.grandTotal)}</span> },
  { key: 'status', header: 'Payment', render: (p) => <PaymentStatusBadge status={p.paymentStatus} /> },
]

function SupplierLedger({ purchases }: { purchases: Purchase[] }) {
  if (purchases.length === 0) return <EmptyState title="No ledger entries" />
  let running = 0
  const rows = purchases.map((p) => {
    running += p.grandTotal - p.amountPaid
    return { p, balance: running }
  })
  return (
    <DataTable
      columns={[
        { key: 'bill', header: 'Bill', render: ({ p }) => <span className="font-medium">{p.billNumber}</span> },
        { key: 'date', header: 'Date', render: ({ p }) => <span className="text-muted-foreground">{formatDate(p.date)}</span> },
        { key: 'debit', header: 'Purchases', className: 'text-right', render: ({ p }) => <span className="tabular">{formatCurrency(p.grandTotal)}</span> },
        { key: 'credit', header: 'Paid', className: 'text-right', render: ({ p }) => <span className="tabular text-success">{formatCurrency(p.amountPaid)}</span> },
        { key: 'balance', header: 'Balance', className: 'text-right', render: ({ balance }) => <span className="font-semibold tabular">{formatCurrency(balance)}</span> },
      ]}
      data={rows}
      keyField={(r) => r.p.id}
      stickyHeader={false}
    />
  )
}
