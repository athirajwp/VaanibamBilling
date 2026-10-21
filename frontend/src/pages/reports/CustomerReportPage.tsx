import { useMemo, useState } from 'react'
import { Users } from 'lucide-react'
import { ReportTemplate } from '@/components/reports/ReportTemplate'
import { DataTable, type Column } from '@/components/common/DataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { reportService } from '@/services/reportService'
import { formatCurrency, formatDate, daysAgoISO } from '@/lib/format'
import type { Customer } from '@/types'

interface CustomerRow extends Customer {
  totalSales: number
  totalPaid: number
  outstanding: number
  lastPurchase?: string
}

export function CustomerReportPage() {
  const [range, setRange] = useState({ from: daysAgoISO(89), to: daysAgoISO(0) })

  const rows = useMemo(() => reportService().customers(range), [range])

  const totals = useMemo(() => {
    const totalSales = rows.reduce((s, r) => s + r.totalSales, 0)
    const totalPaid = rows.reduce((s, r) => s + r.totalPaid, 0)
    const outstanding = rows.reduce((s, r) => s + r.outstanding, 0)
    return { totalSales, totalPaid, outstanding }
  }, [rows])

  const top = useMemo(() => [...rows].sort((a, b) => b.totalSales - a.totalSales).slice(0, 5), [rows])

  return (
    <ReportTemplate
      title="Customer Report"
      description={`${rows.length} customers in selected period`}
      icon={<Users className="h-5 w-5" />}
      range={range}
      onRangeChange={setRange}
      exportName="customer-report"
      exportRows={[
        ['Customer', 'Phone', 'Total Sales', 'Paid', 'Outstanding', 'Last Purchase'],
        ...rows.map((r) => [r.name, r.phone ?? '', String(r.totalSales), String(r.totalPaid), String(r.outstanding), r.lastPurchase ?? '']),
      ]}
    >
      <div className="grid grid-cols-3 gap-3">
        <StatCardMini label="Total Sales" value={formatCurrency(totals.totalSales)} />
        <StatCardMini label="Collected" value={formatCurrency(totals.totalPaid)} />
        <StatCardMini label="Outstanding" value={formatCurrency(totals.outstanding)} />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {top.map((r, i) => (
            <div key={r.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.name}</p>
                <p className="text-[11px] text-muted-foreground">{r.phone || 'No phone'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular">{formatCurrency(r.totalSales)}</p>
                <p className="text-[11px] text-muted-foreground">Last {r.lastPurchase ? formatDate(r.lastPurchase) : '—'}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={cols} data={rows} keyField={(r) => r.id} stickyHeader={false} />
        </CardContent>
      </Card>
    </ReportTemplate>
  )
}

function StatCardMini({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold tabular">{value}</p>
    </Card>
  )
}

const cols: Column<CustomerRow>[] = [
  {
    key: 'customer',
    header: 'Customer',
    render: (r) => (
      <div>
        <p className="font-medium">{r.name}</p>
        <p className="text-[11px] text-muted-foreground">{r.phone || 'No phone'}</p>
      </div>
    ),
  },
  { key: 'sales', header: 'Sales', className: 'text-right', render: (r) => <span className="font-semibold tabular">{formatCurrency(r.totalSales)}</span> },
  { key: 'paid', header: 'Paid', className: 'text-right', render: (r) => <span className="tabular text-success">{formatCurrency(r.totalPaid)}</span> },
  {
    key: 'due',
    header: 'Outstanding',
    className: 'text-right',
    render: (r) => (
      <span className={`font-medium tabular ${r.outstanding > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
        {formatCurrency(r.outstanding)}
      </span>
    ),
  },
  { key: 'last', header: 'Last Purchase', render: (r) => <span className="text-muted-foreground">{r.lastPurchase ? formatDate(r.lastPurchase) : '—'}</span> },
]
