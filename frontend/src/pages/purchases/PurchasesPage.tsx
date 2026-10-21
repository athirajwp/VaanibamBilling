import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Plus, IndianRupee, Wallet, FileText, ArrowRight, Undo2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column } from '@/components/common/DataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PaymentStatusBadge, DocumentStatusBadge } from '@/components/common/StatusBadge'
import { usePurchaseStore } from '@/stores/usePurchaseStore'
import { useSupplierStore } from '@/stores/useSupplierStore'
import type { Purchase } from '@/types'
import { formatCurrency, formatDate, daysAgoISO } from '@/lib/format'

export function PurchasesPage() {
  const navigate = useNavigate()
  const purchases = usePurchaseStore((s) => s.purchases)
  const suppliers = useSupplierStore((s) => s.suppliers)

  const stats = useMemo(() => {
    const today = daysAgoISO(0)
    const monthStart = daysAgoISO(29)
    const active = purchases.filter((p) => p.status !== 'cancelled')
    const todayTotal = active
      .filter((p) => p.date.slice(0, 10) === today)
      .reduce((s, p) => s + p.grandTotal, 0)
    const monthTotal = active
      .filter((p) => p.date.slice(0, 10) >= monthStart)
      .reduce((s, p) => s + p.grandTotal, 0)
    const pendingBills = active.filter((p) => p.paymentStatus !== 'paid')
    const dueTotal = active.reduce((s, p) => s + (p.grandTotal - p.amountPaid), 0)
    const supplierDue =
      suppliers.reduce((sum, su) => {
        const list = active.filter((p) => p.supplierId === su.id)
        const total = list.reduce((x, p) => x + p.grandTotal, 0)
        const paid = list.reduce((x, p) => x + p.amountPaid, 0)
        return sum + (total - paid) + (su.openingBalance ?? 0)
      }, 0)
    return { todayTotal, monthTotal, pendingBills: pendingBills.length, dueTotal, supplierDue }
  }, [purchases, suppliers])

  const recent = useMemo(
    () => purchases.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8),
    [purchases],
  )

  return (
    <div>
      <PageHeader
        title="Purchases"
        description={`${purchases.length} purchase bills`}
        icon={<ShoppingBag className="h-5 w-5" />}
      >
        <Button size="sm" onClick={() => navigate('/purchases/new')}>
          <Plus className="h-4 w-4" /> New Purchase Bill
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
        <StatCard title="Today's Purchases" value={formatCurrency(stats.todayTotal)} icon={<IndianRupee className="h-4 w-4" />} />
        <StatCard title="This Month" value={formatCurrency(stats.monthTotal)} icon={<ShoppingBag className="h-4 w-4" />} iconClassName="bg-info/10 text-info" />
        <StatCard title="Pending Bills" value={String(stats.pendingBills)} hint={formatCurrency(stats.dueTotal)} icon={<FileText className="h-4 w-4" />} iconClassName="bg-warning/10 text-warning" onClick={() => navigate('/purchases/bills')} />
        <StatCard title="Supplier Due" value={formatCurrency(stats.supplierDue)} icon={<Wallet className="h-4 w-4" />} iconClassName="bg-warning/10 text-warning" onClick={() => navigate('/suppliers/ledger')} />
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 pt-0 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Purchase Bills</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/purchases/bills')}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={billCols}
              data={recent}
              keyField={(p) => p.id}
              onRowClick={(p) => navigate(`/purchases/bills/${p.id}`)}
              stickyHeader={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Undo2 className="h-4 w-4 text-muted-foreground" /> Purchase Returns
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Manage goods returned to suppliers and debit notes.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/purchases/returns')}>
              Open Returns
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const billCols: Column<Purchase>[] = [
  { key: 'bill', header: 'Bill #', render: (p) => <span className="font-medium">{p.billNumber}</span> },
  { key: 'supplier', header: 'Supplier', render: (p) => <span>{p.supplierName}</span> },
  { key: 'date', header: 'Date', render: (p) => <span className="text-muted-foreground">{formatDate(p.date)}</span> },
  { key: 'items', header: 'Items', className: 'text-center', render: (p) => <span className="tabular">{p.items.length}</span> },
  {
    key: 'amount',
    header: 'Amount',
    className: 'text-right',
    render: (p) => (
      <div className="text-right">
        <p className="font-semibold tabular">{formatCurrency(p.grandTotal)}</p>
        <p className="text-[11px] text-muted-foreground">Paid {formatCurrency(p.amountPaid)}</p>
      </div>
    ),
  },
  { key: 'payment', header: 'Payment', render: (p) => <PaymentStatusBadge status={p.paymentStatus} /> },
  { key: 'status', header: 'Status', render: (p) => <DocumentStatusBadge status={p.status} /> },
]
