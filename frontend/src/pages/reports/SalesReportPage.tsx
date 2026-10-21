import { useMemo, useState } from 'react'
import { ShoppingCart, Banknote, Clock, ReceiptText, Percent } from 'lucide-react'
import { ReportTemplate } from '@/components/reports/ReportTemplate'
import { StatCard } from '@/components/common/StatCard'
import { SalesAnalyticsChart } from '@/components/reports/SalesChart'
import { DataTable, type Column } from '@/components/common/DataTable'
import { PaymentStatusBadge } from '@/components/common/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { reportService } from '@/services/reportService'
import { formatCurrency, daysAgoISO } from '@/lib/format'
import type { Invoice } from '@/types'

export function SalesReportPage() {
  const [range, setRange] = useState({ from: daysAgoISO(29), to: daysAgoISO(0) })

  const data = useMemo(() => {
    const svc = reportService()
    const sales = svc.sales(range)
    const series = svc.dailySeries(range)
    const total = sales.reduce((s, i) => s + i.grandTotal, 0)
    const collected = sales.reduce((s, i) => s + i.amountPaid, 0)
    return { sales, series, total, collected, outstanding: total - collected, orders: sales.length }
  }, [range])

  return (
    <ReportTemplate
      title="Sales Report"
      description={`${data.orders} invoices in selected period`}
      icon={<ShoppingCart className="h-5 w-5" />}
      range={range}
      onRangeChange={setRange}
      exportName="sales-report"
      exportRows={[
        ['Invoice', 'Date', 'Customer', 'Amount', 'Paid', 'Status'],
        ...data.sales.map((i) => [i.invoiceNumber, i.date.slice(0, 10), i.customerName, String(i.grandTotal), String(i.amountPaid), i.paymentStatus]),
      ]}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard title="Total Sales" value={formatCurrency(data.total)} icon={<ShoppingCart className="h-4 w-4" />} />
        <StatCard title="Collected" value={formatCurrency(data.collected)} icon={<Banknote className="h-4 w-4" />} iconClassName="bg-success/10 text-success" />
        <StatCard title="Outstanding" value={formatCurrency(data.outstanding)} icon={<Clock className="h-4 w-4" />} iconClassName="bg-warning/10 text-warning" />
        <StatCard title="Invoices" value={String(data.orders)} icon={<ReceiptText className="h-4 w-4" />} iconClassName="bg-info/10 text-info" />
        <StatCard
          title="Avg Invoice"
          value={formatCurrency(data.orders > 0 ? data.total / data.orders : 0)}
          icon={<Percent className="h-4 w-4" />}
        />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesAnalyticsChart data={data.series} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={salesCols}
            data={data.sales}
            keyField={(i) => i.id}
            stickyHeader={false}
          />
        </CardContent>
      </Card>
    </ReportTemplate>
  )
}

const salesCols: Column<Invoice>[] = [
  { key: 'inv', header: 'Invoice', render: (i) => <span className="font-medium">{i.invoiceNumber}</span> },
  { key: 'customer', header: 'Customer', render: (i) => <span>{i.customerName}</span> },
  { key: 'date', header: 'Date', render: (i) => <span className="text-muted-foreground">{i.date.slice(0, 10)}</span> },
  { key: 'amount', header: 'Amount', className: 'text-right', render: (i) => <span className="font-semibold tabular">{formatCurrency(i.grandTotal)}</span> },
  { key: 'paid', header: 'Paid', className: 'text-right', render: (i) => <span className="tabular text-success">{formatCurrency(i.amountPaid)}</span> },
  { key: 'status', header: 'Status', render: (i) => <PaymentStatusBadge status={i.paymentStatus} /> },
]
