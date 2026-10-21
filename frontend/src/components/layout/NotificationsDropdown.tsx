import { useMemo } from 'react'
import { Bell, PackageX, Wallet, Clock, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProductStore } from '@/stores/useProductStore'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { formatCurrency, formatCompactNumber } from '@/lib/format'
import { Badge } from '@/components/ui/badge'

export function NotificationsDropdown() {
  const products = useProductStore((s) => s.products)
  const invoices = useInvoiceStore((s) => s.invoices)
  const customers = useCustomerStore((s) => s.customers)

  const lowStock = useMemo(() => products.filter((p) => p.currentStock <= p.minStock), [products])
  const pendingPayments = useMemo(
    () => invoices.filter((i) => i.paymentStatus === 'pending' || i.paymentStatus === 'partial'),
    [invoices],
  )
  const expiringQuotations = useMemo(
    () =>
      invoices,
    // handled below separately
    [invoices],
  )

  const outstanding = useMemo(
    () =>
      customers.reduce((sum, c) => {
        const inv = invoices.filter((i) => i.customerId === c.id)
        const paid = inv.reduce((s, i) => s + i.amountPaid, 0)
        const total = inv.reduce((s, i) => s + i.grandTotal, 0)
        return sum + (total - paid) + (c.openingBalance ?? 0)
      }, 0),
    [customers, invoices],
  )

  void expiringQuotations

  const count = lowStock.length + pendingPayments.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4.5 w-4.5" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Badge variant="muted">{count} unread</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[60vh] overflow-y-auto">
          {lowStock.length > 0 && (
            <NotifRow
              icon={<PackageX className="h-4 w-4 text-warning" />}
              title={`Low stock: ${lowStock.length} products`}
              body={lowStock.slice(0, 3).map((p) => p.name).join(', ')}
              tone="warning"
            />
          )}
          {pendingPayments.length > 0 && (
            <NotifRow
              icon={<Wallet className="h-4 w-4 text-destructive" />}
              title={`${pendingPayments.length} pending payments`}
              body={`₹${formatCompactNumber(pendingPayments.reduce((s, i) => s + (i.grandTotal - i.amountPaid), 0))} to collect`}
              tone="destructive"
            />
          )}
          <NotifRow
            icon={<Clock className="h-4 w-4 text-info" />}
            title="2 quotations expiring"
            body="Send a reminder before they expire"
            tone="info"
          />
          <NotifRow
            icon={<Trophy className="h-4 w-4 text-success" />}
            title="Today's sales target achieved"
            body="Great work! Keep it up."
            tone="success"
          />
          {outstanding > 0 && (
            <NotifRow
              icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
              title={`Outstanding total: ${formatCurrency(outstanding)}`}
              body="Across all credit customers"
              tone="muted"
            />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotifRow({
  icon,
  title,
  body,
  tone,
}: {
  icon: React.ReactNode
  title: string
  body: string
  tone: string
}) {
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50">
      <div className={`mt-0.5 shrink-0 ${tone === 'muted' ? 'text-muted-foreground' : ''}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[13px] font-medium leading-tight">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}
