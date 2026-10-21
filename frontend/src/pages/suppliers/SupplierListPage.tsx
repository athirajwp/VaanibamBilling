import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Plus, Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { FilterBar } from '@/components/common/FilterBar'
import { DataTable, type Column } from '@/components/common/DataTable'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SupplierForm } from '@/components/suppliers/SupplierForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSupplierStore } from '@/stores/useSupplierStore'
import { usePurchaseStore } from '@/stores/usePurchaseStore'
import type { Supplier } from '@/types'
import { formatCurrency } from '@/lib/format'

export function SupplierListPage() {
  const navigate = useNavigate()
  const suppliers = useSupplierStore((s) => s.suppliers)
  const purchases = usePurchaseStore((s) => s.purchases)
  const deleteSupplier = useSupplierStore((s) => s.deleteSupplier)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return suppliers.filter((s) => !q || s.name.toLowerCase().includes(q) || (s.phone ?? '').includes(q))
  }, [suppliers, search])

  const stats = (id: string) => {
    const list = purchases.filter((p) => p.supplierId === id && p.status !== 'cancelled')
    const total = list.reduce((s, p) => s + p.grandTotal, 0)
    const paid = list.reduce((s, p) => s + p.amountPaid, 0)
    return { total, paid, due: total - paid + (suppliers.find((s) => s.id === id)?.openingBalance ?? 0) }
  }

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description={`${suppliers.length} suppliers`}
        icon={<Truck className="h-5 w-5" />}
      >
        <SupplierForm
          triggerLabel={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Supplier
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
          columns={supplierColumns({
            onView: (s) => navigate(`/suppliers/${s.id}`),
            onEdit: setEditSupplier,
            onDelete: (s) => setDeleteId(s.id),
            stats,
          })}
          data={filtered}
          keyField={(s) => s.id}
          onRowClick={(s) => navigate(`/suppliers/${s.id}`)}
        />
      </div>

      {editSupplier && (
        <SupplierForm
          supplier={editSupplier}
          open
          onOpenChange={(o) => !o && setEditSupplier(null)}
          triggerLabel={<span />}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete supplier?"
        description="This will remove the supplier from your records."
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteSupplier(deleteId)}
      />
    </div>
  )
}

function supplierColumns(ctx: {
  onView: (s: Supplier) => void
  onEdit: (s: Supplier) => void
  onDelete: (s: Supplier) => void
  stats: (id: string) => { total: number; paid: number; due: number }
}): Column<Supplier>[] {
  return [
    {
      key: 'name',
      header: 'Supplier',
      render: (s) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info/10 text-xs font-bold text-info">
            {s.name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="font-medium">{s.name}</p>
            <p className="text-[11px] text-muted-foreground">{s.phone || 'No phone'}</p>
          </div>
        </div>
      ),
    },
    { key: 'purchases', header: 'Purchases', className: 'text-right', render: (s) => <span className="font-semibold tabular">{formatCurrency(ctx.stats(s.id).total)}</span> },
    { key: 'paid', header: 'Paid', className: 'text-right', render: (s) => <span className="text-muted-foreground tabular">{formatCurrency(ctx.stats(s.id).paid)}</span> },
    {
      key: 'due',
      header: 'Amount Due',
      className: 'text-right',
      render: (s) => {
        const due = ctx.stats(s.id).due
        return <span className={`font-semibold tabular ${due > 0 ? 'text-warning' : 'text-muted-foreground'}`}>{formatCurrency(due)}</span>
      },
    },
    { key: 'gstin', header: 'GSTIN', className: 'hidden lg:table-cell', render: (s) => <span className="text-xs text-muted-foreground">{s.gstin || '—'}</span> },
    { key: 'status', header: 'Status', render: (s) => <Badge variant={s.status === 'active' ? 'success' : 'muted'}>{s.status}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'w-14',
      render: (s) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-md p-1.5 hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => ctx.onView(s)}>
              <Eye className="h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => ctx.onEdit(s)}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => ctx.onDelete(s)} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
