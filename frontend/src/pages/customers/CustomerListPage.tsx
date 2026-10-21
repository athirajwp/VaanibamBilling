import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Eye, Pencil, Trash2, MoreHorizontal, Phone, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { FilterBar } from '@/components/common/FilterBar'
import { DataTable, type Column } from '@/components/common/DataTable'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import type { Customer } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { toast } from '@/stores/useToastStore'

export function CustomerListPage() {
  const navigate = useNavigate()
  const customers = useCustomerStore((s) => s.customers)
  const invoices = useInvoiceStore((s) => s.invoices)
  const deleteCustomer = useCustomerStore((s) => s.deleteCustomer)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return customers.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? '').includes(q),
    )
  }, [customers, search])

  const stats = (customerId: string) => {
    const list = invoices.filter(
      (i) => i.customerId === customerId && i.status !== 'cancelled',
    )
    const total = list.reduce((s, i) => s + i.grandTotal, 0)
    const paid = list.reduce((s, i) => s + i.amountPaid, 0)
    const last = list[0]?.date
    return { total, paid, outstanding: total - paid + (customers.find((c) => c.id === customerId)?.openingBalance ?? 0), last }
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${customers.length} customers`}
        icon={<Users className="h-5 w-5" />}
      >
        <CustomerForm
          triggerLabel={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Customer
            </Button>
          }
        />
      </PageHeader>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          containerClassName="w-72"
        />
      </FilterBar>

      <div className="p-4">
        <DataTable
          columns={customerColumns({
            onView: (c) => navigate(`/customers/${c.id}`),
            onEdit: setEditCustomer,
            onDelete: (c) => setDeleteId(c.id),
            stats,
          })}
          data={filtered}
          keyField={(c) => c.id}
          onRowClick={(c) => navigate(`/customers/${c.id}`)}
        />
      </div>

      {editCustomer && (
        <CustomerForm
          customer={editCustomer}
          open
          onOpenChange={(o) => !o && setEditCustomer(null)}
          triggerLabel={<span />}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete customer?"
        description="This will remove the customer from your records. Invoice history is preserved."
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteCustomer(deleteId)}
      />
    </div>
  )
}

function customerColumns(ctx: {
  onView: (c: Customer) => void
  onEdit: (c: Customer) => void
  onDelete: (c: Customer) => void
  stats: (id: string) => { total: number; paid: number; outstanding: number; last?: string }
}): Column<Customer>[] {
  return [
    {
      key: 'name',
      header: 'Customer',
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {c.name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="font-medium">{c.name}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Phone className="h-3 w-3" /> {c.phone || 'No phone'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      className: 'hidden lg:table-cell',
      render: (c) => (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {c.address || '—'}
        </span>
      ),
    },
    {
      key: 'totalSales',
      header: 'Total Sales',
      className: 'text-right',
      render: (c) => <span className="font-semibold tabular">{formatCurrency(ctx.stats(c.id).total)}</span>,
    },
    {
      key: 'paid',
      header: 'Paid',
      className: 'text-right',
      render: (c) => <span className="text-muted-foreground tabular">{formatCurrency(ctx.stats(c.id).paid)}</span>,
    },
    {
      key: 'outstanding',
      header: 'Outstanding',
      className: 'text-right',
      render: (c) => {
        const out = ctx.stats(c.id).outstanding
        return (
          <span className={`font-semibold tabular ${out > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
            {formatCurrency(out)}
          </span>
        )
      },
    },
    {
      key: 'last',
      header: 'Last Purchase',
      className: 'hidden md:table-cell',
      render: (c) => (
        <span className="text-xs text-muted-foreground">
          {ctx.stats(c.id).last ? formatDate(ctx.stats(c.id).last!) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <Badge variant={c.status === 'active' ? 'success' : 'muted'}>{c.status}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-14',
      render: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-md p-1.5 hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => ctx.onView(c)}>
              <Eye className="h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => ctx.onEdit(c)}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                ctx.onDelete(c)
                toast.info('Customer deleted')
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
