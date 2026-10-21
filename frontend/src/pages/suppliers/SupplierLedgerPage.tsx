import { useMemo, useState } from 'react'
import { Truck, Download, Printer } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DateRangePicker } from '@/components/common/DateRangePicker'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column } from '@/components/common/DataTable'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useSupplierStore } from '@/stores/useSupplierStore'
import { usePurchaseStore } from '@/stores/usePurchaseStore'
import { formatCurrency, formatDate, daysAgoISO } from '@/lib/format'
import { downloadCsv } from '@/lib/desktop/fs'
import { toast } from '@/stores/useToastStore'
import { withinRange } from '@/services/reportService'

export function SupplierLedgerPage() {
  const suppliers = useSupplierStore((s) => s.suppliers)
  const purchases = usePurchaseStore((s) => s.purchases)
  const [supplierId, setSupplierId] = useState('all')
  const [range, setRange] = useState({ from: daysAgoISO(89), to: daysAgoISO(0) })

  const rows = useMemo(() => {
    const list = purchases
      .filter(
        (p) =>
          p.status !== 'cancelled' &&
          (supplierId === 'all' || p.supplierId === supplierId) &&
          withinRange(p.date, range),
      )
      .sort((a, b) => a.date.localeCompare(b.date))
    const running = new Map<string, number>()
    return list.map((p) => {
      const prev = running.get(p.supplierId) ?? 0
      const balance = prev + p.grandTotal - p.amountPaid
      running.set(p.supplierId, balance)
      return {
        id: p.id,
        date: p.date,
        billNumber: p.billNumber,
        supplierName: p.supplierName,
        purchases: p.grandTotal,
        paid: p.amountPaid,
        balance,
      }
    })
  }, [purchases, supplierId, range])

  const totals = useMemo(() => {
    const purchasesTotal = rows.reduce((s, r) => s + r.purchases, 0)
    const paid = rows.reduce((s, r) => s + r.paid, 0)
    return { purchases: purchasesTotal, paid, due: purchasesTotal - paid }
  }, [rows])

  const totalDue = useMemo(
    () =>
      suppliers.reduce((sum, s) => {
        const list = purchases.filter((p) => p.supplierId === s.id && p.status !== 'cancelled')
        const total = list.reduce((x, p) => x + p.grandTotal, 0)
        const paid = list.reduce((x, p) => x + p.amountPaid, 0)
        return sum + (total - paid) + (s.openingBalance ?? 0)
      }, 0),
    [suppliers, purchases],
  )

  const exportCsv = async () => {
    await downloadCsv('supplier-ledger.csv', [
      ['Date', 'Bill', 'Supplier', 'Purchases', 'Paid', 'Balance'],
      ...rows.map((r) => [r.date, r.billNumber, r.supplierName, String(r.purchases), String(r.paid), String(r.balance)]),
    ])
    toast.success('Ledger exported', 'supplier-ledger.csv downloaded.')
  }

  return (
    <div>
      <PageHeader
        title="Supplier Ledger"
        description="Running balance of every supplier"
        icon={<Truck className="h-5 w-5" />}
      >
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.info('Print', 'Ledger sent to printer.')}>
          <Printer className="h-4 w-4" /> Print
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
        <StatCard title="Purchases (range)" value={formatCurrency(totals.purchases)} icon={<Truck className="h-4 w-4" />} />
        <StatCard title="Paid (range)" value={formatCurrency(totals.paid)} icon={<Truck className="h-4 w-4" />} iconClassName="bg-success/10 text-success" />
        <StatCard title="Net Due" value={formatCurrency(totals.due)} icon={<Truck className="h-4 w-4" />} iconClassName="bg-warning/10 text-warning" />
        <StatCard title="Total Due" value={formatCurrency(totalDue)} icon={<Truck className="h-4 w-4" />} iconClassName="bg-warning/10 text-warning" />
      </div>

      <div className="p-4 pt-0">
        <Card>
          <CardContent className="pt-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="h-8 w-56">
                  <SelectValue placeholder="All suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DateRangePicker value={range} onChange={setRange} />
            </div>
            <DataTable columns={columns} data={rows} keyField={(r) => r.id} stickyHeader={false} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const columns: Column<{ id: string; date: string; billNumber: string; supplierName: string; purchases: number; paid: number; balance: number }>[] = [
  { key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground">{formatDate(r.date)}</span> },
  { key: 'bill', header: 'Bill', render: (r) => <span className="font-medium">{r.billNumber}</span> },
  { key: 'supplier', header: 'Supplier', render: (r) => <span>{r.supplierName}</span> },
  { key: 'purchases', header: 'Purchases', className: 'text-right', render: (r) => <span className="tabular">{formatCurrency(r.purchases)}</span> },
  { key: 'paid', header: 'Paid', className: 'text-right', render: (r) => <span className="tabular text-success">{formatCurrency(r.paid)}</span> },
  { key: 'balance', header: 'Balance', className: 'text-right', render: (r) => <span className={`font-semibold tabular ${r.balance > 0 ? 'text-warning' : 'text-muted-foreground'}`}>{formatCurrency(r.balance)}</span> },
]
