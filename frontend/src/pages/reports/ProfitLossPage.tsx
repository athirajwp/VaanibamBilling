import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, ShoppingCart, ShoppingBag, Wallet, Percent } from 'lucide-react'
import { ReportTemplate } from '@/components/reports/ReportTemplate'
import { StatCard } from '@/components/common/StatCard'
import { DonutChart } from '@/components/reports/SalesChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { reportService, expenseReportService } from '@/services/reportService'
import { formatCurrency, daysAgoISO } from '@/lib/format'

const palette = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

export function ProfitLossPage() {
  const [range, setRange] = useState({ from: daysAgoISO(29), to: daysAgoISO(0) })

  const data = useMemo(() => {
    const svc = reportService()
    const summary = svc.summary(range)
    const salesList = svc.sales(range)
    const costOfGoods = salesList.reduce(
      (sum, inv) =>
        sum +
        inv.items.reduce((s, it) => {
          const product = svc.inventory().find((p) => p.id === it.productId)
          return s + (product?.purchasePrice ?? it.price) * it.qty
        }, 0),
      0,
    )
    const grossProfit = summary.sales - costOfGoods
    const byCategory = expenseReportService.byCategory()
    const expenses = byCategory.reduce((s, e) => s + e.amount, 0)
    const netProfit = grossProfit - expenses
    return { summary, costOfGoods, grossProfit, byCategory, expenses, netProfit }
  }, [range])

  const margin = data.summary.sales > 0 ? (data.netProfit / data.summary.sales) * 100 : 0
  const donut = data.byCategory.map((e, i) => ({ name: e.name, value: e.amount, color: palette[i % palette.length] }))

  return (
    <ReportTemplate
      title="Profit & Loss"
      description="Revenue minus cost of goods sold and expenses"
      icon={<TrendingUp className="h-5 w-5" />}
      range={range}
      onRangeChange={setRange}
      exportName="profit-loss"
      exportRows={[
        ['Metric', 'Amount'],
        ['Sales', String(data.summary.sales)],
        ['Cost of Goods Sold', String(data.costOfGoods)],
        ['Gross Profit', String(data.grossProfit)],
        ['Expenses', String(data.expenses)],
        ['Net Profit', String(data.netProfit)],
      ]}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard title="Sales" value={formatCurrency(data.summary.sales)} icon={<ShoppingCart className="h-4 w-4" />} />
        <StatCard title="COGS" value={formatCurrency(data.costOfGoods)} icon={<ShoppingBag className="h-4 w-4" />} iconClassName="bg-info/10 text-info" />
        <StatCard title="Gross Profit" value={formatCurrency(data.grossProfit)} icon={<TrendingUp className="h-4 w-4" />} iconClassName="bg-success/10 text-success" />
        <StatCard title="Expenses" value={formatCurrency(data.expenses)} icon={<Wallet className="h-4 w-4" />} iconClassName="bg-destructive/10 text-destructive" />
        <StatCard
          title="Net Profit"
          value={formatCurrency(data.netProfit)}
          change={data.summary.sales > 0 ? data.netProfit : 0}
          icon={data.netProfit >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          iconClassName={data.netProfit >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" /> Profit Margin
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold tabular">{margin.toFixed(1)}%</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Net profit as a share of sales in the selected period
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${Math.min(100, Math.max(0, margin))}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {donut.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No expenses in this period.</p>
            ) : (
              <DonutChart data={donut} />
            )}
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  )
}
