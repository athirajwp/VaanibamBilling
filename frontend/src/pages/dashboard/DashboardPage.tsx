import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IndianRupee, ShoppingCart, TrendingUp, Wallet, ArrowRight, PackageX, Download, Printer } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard'
import { DateRangePicker } from '@/components/common/DateRangePicker'
import { DataTable, type Column } from '@/components/common/DataTable'
import { SalesAnalyticsChart } from '@/components/reports/SalesChart'
import { PaymentStatusBadge, DocumentStatusBadge } from '@/components/common/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProductStore } from '@/stores/useProductStore'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { reportService } from '@/services/reportService'
import { formatCurrency, formatDate, daysAgoISO } from '@/lib/format'
import type { Invoice } from '@/types'

const chartRanges = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '1 Year', days: 365 },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const products = useProductStore((s) => s.products)
  const invoices = useInvoiceStore((s) => s.invoices)
  const customers = useCustomerStore((s) => s.customers)
  const [range, setRange] = useState({ from: daysAgoISO(6), to: daysAgoISO(0) })
  const [chartDays, setChartDays] = useState(30)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const stats = useMemo(() => {
    const today = daysAgoISO(0)
    const todayInvoices = invoices.filter((i) => i.date.slice(0, 10) === today && i.status !== 'cancelled')
    const salesToday = todayInvoices.reduce((s, i) => s + i.grandTotal, 0)
    const orders = todayInvoices.length
    const r = reportService()
    const summary = r.summary({ from: daysAgoISO(6), to: today })
    const outstanding = customers.reduce((s, c) => {
      const inv = invoices.filter((i) => i.customerId === c.id && i.status !== 'cancelled')
      const paid = inv.reduce((x, i) => x + i.amountPaid, 0)
      const total = inv.reduce((x, i) => x + i.grandTotal, 0)
      return s + (total - paid) + (c.openingBalance ?? 0)
    }, 0)
    return { salesToday, orders, profit: summary.profit, outstanding }
  }, [invoices, customers])

  const chartData = useMemo(() => {
    const r = reportService()
    return r.dailySeries({
      from: daysAgoISO(chartDays),
      to: daysAgoISO(0),
    })
  }, [chartDays, invoices])

  const topProducts = useMemo(() => {
    const r = reportService()
    return r.topProducts({ from: daysAgoISO(30), to: daysAgoISO(0) })
  }, [invoices])

  const lowStock = useMemo(
    () =>
      products
        .filter((p) => p.currentStock <= p.minStock)
        .sort((a, b) => a.currentStock / Math.max(1, a.minStock) - b.currentStock / Math.max(1, b.minStock))
        .slice(0, 6),
    [products],
  )

  const recentInvoices = useMemo(
    () =>
      invoices
        .filter((i) => i.status !== 'cancelled')
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8),
    [invoices],
  )

  return (
    <div className="mx-auto max-w-[1400px] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{greeting}, Athi 👋</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={range} onChange={setRange} />
          <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
            <Download className="h-4 w-4" /> Reports
          </Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats.salesToday)}
          change={12.5}
          icon={<IndianRupee className="h-4.5 w-4.5" />}
          onClick={() => navigate('/sales/invoices')}
        />
        <StatCard
          title="Orders"
          value={String(stats.orders)}
          change={8.2}
          icon={<ShoppingCart className="h-4.5 w-4.5" />}
          iconClassName="bg-info/10 text-info"
          onClick={() => navigate('/sales/invoices')}
        />
        <StatCard
          title="Gross Profit"
          value={formatCurrency(stats.profit)}
          change={10.4}
          icon={<TrendingUp className="h-4.5 w-4.5" />}
          iconClassName="bg-success/10 text-success"
          onClick={() => navigate('/reports/profit')}
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(stats.outstanding)}
          change={-4.2}
          icon={<Wallet className="h-4.5 w-4.5" />}
          iconClassName="bg-warning/10 text-warning"
          onClick={() => navigate('/customers/ledger')}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Sales Analytics</CardTitle>
            <Tabs value={String(chartDays)} onValueChange={(v) => setChartDays(Number(v))}>
              <TabsList>
                {chartRanges.map((cr) => (
                  <TabsTrigger key={cr.days} value={String(cr.days)} className="text-xs">
                    {cr.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <SalesAnalyticsChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Low Stock
              <Button variant="ghost" size="sm" onClick={() => navigate('/inventory/stock')}>
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {lowStock.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">All products are well stocked.</p>
            )}
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-warning/10 text-warning">
                  <PackageX className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.currentStock} {p.unit} · min {p.minStock}
                  </p>
                </div>
                <div className="shrink-0">
                  <StockBar current={p.currentStock} min={p.minStock} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/sales/invoices')}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={recentColumns}
              data={recentInvoices}
              keyField={(i) => i.id}
              onRowClick={(i) => navigate(`/sales/invoices/${i.id}`)}
              stickyHeader={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Top Selling Products</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports/sales')}>
              <Printer className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {topProducts.map((p, idx) => (
              <div key={p.productName} className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold text-muted-foreground">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.productName}</p>
                  <p className="text-[11px] text-muted-foreground">{p.units} units sold</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular">{formatCurrency(p.revenue)}</p>
                  <p className="text-[11px] text-success tabular">+{formatCurrency(p.profit)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const recentColumns: Column<Invoice>[] = [
  {
    key: 'invoice',
    header: 'Invoice',
    render: (i) => <span className="font-medium">{i.invoiceNumber}</span>,
  },
  {
    key: 'customer',
    header: 'Customer',
    render: (i) => <span className="text-muted-foreground">{i.customerName}</span>,
  },
  {
    key: 'date',
    header: 'Date',
    render: (i) => <span className="text-muted-foreground">{formatDate(i.date)}</span>,
  },
  {
    key: 'amount',
    header: 'Amount',
    className: 'text-right',
    render: (i) => <span className="font-semibold tabular">{formatCurrency(i.grandTotal)}</span>,
  },
  {
    key: 'payment',
    header: 'Payment',
    render: (i) => <PaymentStatusBadge status={i.paymentStatus} />,
  },
  {
    key: 'status',
    header: 'Status',
    render: (i) => <DocumentStatusBadge status={i.status} />,
  },
]

function StockBar({ current, min }: { current: number; min: number }) {
  const pct = Math.min(100, (current / Math.max(1, min)) * 100)
  const color = current === 0 ? 'bg-destructive' : pct < 50 ? 'bg-warning' : 'bg-success'
  return (
    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
