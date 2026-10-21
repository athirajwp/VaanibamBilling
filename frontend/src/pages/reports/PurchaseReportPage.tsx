import { useMemo, useState } from 'react'
import { ShoppingBag, Banknote, Clock, FileText } from 'lucide-react'
import { ReportTemplate } from '@/components/reports/ReportTemplate'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column } from '@/components/common/DataTable'
import { PaymentStatusBadge } from '@/components/common/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { reportService } from '@/services/reportService'
import { formatCurrency, daysAgoISO } from '@/lib/format'
import type { Purchase } from '@/types'

export function PurchaseReportPage() {
  const [range, setRange] = useState({ from: daysAgoISO(29), to: daysAgoISO(0) })

  const data = useMemo(() => {
    const purchases = reportService().purchasesList(range)
    const total = purchases.reduce((s, p) => s + p.grandTotal, 0)
    const paid = purchases.reduce((s, p) => s + p.amountPaid, 0)
    return { purchases, total, paid, due: total - paid }
  }, [range])

  return (
    <ReportTemplate
      title="Purchase Report"
      description={`${data.purchases.length} bills in selected period`}
      icon={<ShoppingBag className="h-5 w-5" />}
      range={range}
      onRangeChange={setRange}
      exportName="purchase-report"
      exportRows={[
        ['Bill', 'Date', 'Supplier', 'Amount', 'Paid', 'Status'],
        ...data.purchases.map((p) => [p.billNumber, p.date.slice(0, 10), p.supplierName, String(p.grandTotal), String(p.amountPaid), p.paymentStatus]),
      ]}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Total Purchases" value={formatCurrency(data.total)} icon={<ShoppingBag className="h-4 w-4" />} />
        <StatCard title="Paid" value={formatCurrency(data.paid)} icon={<Banknote className="h-4 w-4" />} iconClassName="bg-success/10 text-success" />
        <StatCard title="Payable" value={formatCurrency(data.due)} icon={<Clock className="h-4 w-4" />} iconClassName="bg-warning/10 text-warning" />
        <StatCard title="Bills" value={String(data.purchases.length)} icon={<FileText className="h-4 w-4" />} iconClassName="bg-info/10 text-info" />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Purchase Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={purchaseCols}
            data={data.purchases}
            keyField={(p) => p.id}
            stickyHeader={false}
          />
        </CardContent>
      </Card>
    </ReportTemplate>
  )
}

const purchaseCols: Column<Purchase>[] = [
  { key: 'bill', header: 'Bill', render: (p) => <span className="font-medium">{p.billNumber}</span> },
  { key: 'supplier', header: 'Supplier', render: (p) => <span>{p.supplierName}</span> },
  { key: 'date', header: 'Date', render: (p) => <span className="text-muted-foreground">{p.date.slice(0, 10)}</span> },
  { key: 'amount', header: 'Amount', className: 'text-right', render: (p) => <span className="font-semibold tabular">{formatCurrency(p.grandTotal)}</span> },
  { key: 'paid', header: 'Paid', className: 'text-right', render: (p) => <span className="tabular text-success">{formatCurrency(p.amountPaid)}</span> },
  { key: 'status', header: 'Status', render: (p) => <PaymentStatusBadge status={p.paymentStatus} /> },
]
