import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookUser, Download, Printer } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DateRangePicker } from '@/components/common/DateRangePicker'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column } from '@/components/common/DataTable'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import { formatCurrency, formatDate, daysAgoISO } from '@/lib/format'
import { downloadCsv } from '@/lib/desktop/fs'
import { toast } from '@/stores/useToastStore'
import { withinRange } from '@/services/reportService'

interface LedgerRow {
  id: string
  date: string
  invoiceNumber: string
  customerId: string
  customerName: string
  sales: number
  paid: number
  balance: number
}

export function CustomerLedgerPage() {
  const navigate = useNavigate()
  const customers = useCustomerStore((s) => s.customers)
  const invoices = useInvoiceStore((s) => s.invoices)
  const [customerId, setCustomerId] = useState('all')
  const [range, setRange] = useState({ from: daysAgoISO(89), to: daysAgoISO(0) })

  const rows = useMemo<LedgerRow[]>(() => {
    const list = invoices
      .filter(
        (i) =>
          i.status !== 'cancelled' &&
          (customerId === 'all' || i.customerId === customerId) &&
          withinRange(i.date, range),
      )
      .sort((a, b) => a.date.localeCompare(b.date))

    const running = new Map<string, number>()
    return list.map((i) => {
      const prev = running.get(i.customerId) ?? 0
      const balance = prev + i.grandTotal - i.amountPaid
      running.set(i.customerId, balance)
      return {
        id: i.id,
        date: i.date,
        invoiceNumber: i.invoiceNumber,
        customerId: i.customerId,
        customerName: i.customerName,
        sales: i.grandTotal,
        paid: i.amountPaid,
        balance,
      }
    })
  }, [invoices, customerId, range])

  const totals = useMemo(() => {
    const sales = rows.reduce((s, r) => s + r.sales, 0)
    const paid = rows.reduce((s, r) => s + r.paid, 0)
    return { sales, paid, balance: sales - paid }
  }, [rows])

  const outstanding = useMemo(
    () =>
      customers.reduce((sum, c) => {
        const inv = invoices.filter((i) => i.customerId === c.id && i.status !== 'cancelled')
        const total = inv.reduce((s, i) => s + i.grandTotal, 0)
        const paid = inv.reduce((s, i) => s + i.amountPaid, 0)
        return sum + (total - paid) + (c.openingBalance ?? 0)
      }, 0),
    [customers, invoices],
  )

  const exportCsv = async () => {
    await downloadCsv('customer-ledger.csv', [
      ['Date', 'Invoice', 'Customer', 'Sales', 'Paid', 'Balance'],
      ...rows.map((r) => [r.date, r.invoiceNumber, r.customerName, String(r.sales), String(r.paid), String(r.balance)]),
    ])
    toast.success('Ledger exported', 'customer-ledger.csv downloaded.')
  }

  return (
    <div>
      <PageHeader
        title="Customer Ledger"
        description="Running balance of every credit customer"
        icon={<BookUser className="h-5 w-5" />}
      >
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.info('Print', 'Ledger sent to printer.')}>
          <Printer className="h-4 w-4" /> Print
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
        <StatCard title="Total Sales (range)" value={formatCurrency(totals.sales)} icon={<BookUser className="h-4 w-4" />} />
        <StatCard title="Total Paid (range)" value={formatCurrency(totals.paid)} icon={<BookUser className="h-4 w-4" />} iconClassName="bg-success/10 text-success" />
        <StatCard title="Net Balance" value={formatCurrency(totals.balance)} icon={<BookUser className="h-4 w-4" />} iconClassName={totals.balance > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'} />
        <StatCard title="Total Outstanding" value={formatCurrency(outstanding)} icon={<BookUser className="h-4 w-4" />} iconClassName="bg-warning/10 text-warning" />
      </div>

      <div className="p-4 pt-0">
        <Card>
          <CardContent className="pt-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className="h-8 w-56">
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DateRangePicker value={range} onChange={setRange} />
            </div>
            <DataTable
              columns={ledgerColumns}
              data={rows}
              keyField={(r) => r.id}
              onRowClick={(r) => navigate(`/sales/invoices/${r.id}`)}
              stickyHeader={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const ledgerColumns: Column<LedgerRow>[] = [
  { key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground">{formatDate(r.date)}</span> },
  { key: 'invoice', header: 'Invoice', render: (r) => <span className="font-medium">{r.invoiceNumber}</span> },
  { key: 'customer', header: 'Customer', render: (r) => <span>{r.customerName}</span> },
  { key: 'sales', header: 'Sales', className: 'text-right', render: (r) => <span className="tabular">{formatCurrency(r.sales)}</span> },
  { key: 'paid', header: 'Paid', className: 'text-right', render: (r) => <span className="tabular text-success">{formatCurrency(r.paid)}</span> },
  { key: 'balance', header: 'Balance', className: 'text-right', render: (r) => <span className={`font-semibold tabular ${r.balance > 0 ? 'text-warning' : 'text-muted-foreground'}`}>{formatCurrency(r.balance)}</span> },
]
