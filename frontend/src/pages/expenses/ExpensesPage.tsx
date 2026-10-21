import { useMemo, useState } from 'react'
import { Wallet, Plus, Pencil, Trash2, Download, MoreHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { SearchInput } from '@/components/common/SearchInput'
import { FilterBar } from '@/components/common/FilterBar'
import { DataTable, type Column } from '@/components/common/DataTable'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Modal } from '@/components/common/Modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useExpenseStore } from '@/stores/useExpenseStore'
import { toast } from '@/stores/useToastStore'
import type { Expense } from '@/types'
import { formatCurrency, formatDate, daysAgoISO } from '@/lib/format'
import { downloadCsv } from '@/lib/desktop/fs'

const paymentMethods = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque']

const emptyForm = {
  date: daysAgoISO(0),
  category: 'Rent',
  description: '',
  amount: '',
  paymentMethod: 'Cash',
  status: 'paid' as 'paid' | 'pending',
}

export function ExpensesPage() {
  const expenses = useExpenseStore((s) => s.expenses)
  const categories = useExpenseStore((s) => s.categories)
  const addExpense = useExpenseStore((s) => s.addExpense)
  const updateExpense = useExpenseStore((s) => s.updateExpense)
  const deleteExpense = useExpenseStore((s) => s.deleteExpense)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Expense | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })

  const stats = useMemo(() => {
    const today = daysAgoISO(0)
    const monthStart = daysAgoISO(29)
    const todayTotal = expenses
      .filter((e) => e.date.slice(0, 10) === today)
      .reduce((s, e) => s + e.amount, 0)
    const monthTotal = expenses
      .filter((e) => e.date.slice(0, 10) >= monthStart)
      .reduce((s, e) => s + e.amount, 0)
    const pending = expenses
      .filter((e) => e.status === 'pending')
      .reduce((s, e) => s + e.amount, 0)
    return { todayTotal, monthTotal, pending }
  }, [expenses])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return expenses
      .filter((e) => {
        if (categoryFilter !== 'all' && e.category !== categoryFilter) return false
        if (q && !e.description.toLowerCase().includes(q) && !e.category.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, search, categoryFilter])

  const openAdd = () => {
    setEdit(null)
    setForm({ ...emptyForm, category: categories[0] ?? 'Other' })
    setOpen(true)
  }

  const openEdit = (e: Expense) => {
    setEdit(e)
    setForm({
      date: e.date.slice(0, 10),
      category: e.category,
      description: e.description,
      amount: String(e.amount),
      paymentMethod: e.paymentMethod,
      status: e.status,
    })
    setOpen(true)
  }

  const save = () => {
    if (!form.description.trim()) {
      toast.warning('Description required', 'Enter a description for this expense.')
      return
    }
    const amount = Number(form.amount) || 0
    if (amount <= 0) {
      toast.warning('Invalid amount', 'Enter an amount greater than zero.')
      return
    }
    const payload = {
      ...form,
      description: form.description.trim(),
      amount,
      date: new Date(form.date).toISOString(),
    }
    if (edit) updateExpense(edit.id, payload)
    else addExpense(payload)
    setOpen(false)
  }

  const exportCsv = async () => {
    await downloadCsv('expenses.csv', [
      ['Date', 'Category', 'Description', 'Amount', 'Method', 'Status'],
      ...filtered.map((e) => [e.date.slice(0, 10), e.category, e.description, String(e.amount), e.paymentMethod, e.status]),
    ])
    toast.success('Expenses exported', 'expenses.csv downloaded.')
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        description={`${expenses.length} expenses recorded`}
        icon={<Wallet className="h-5 w-5" />}
      >
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-3 p-4">
        <StatCard title="Today's Expenses" value={formatCurrency(stats.todayTotal)} icon={<Wallet className="h-4 w-4" />} />
        <StatCard title="This Month" value={formatCurrency(stats.monthTotal)} icon={<Wallet className="h-4 w-4" />} iconClassName="bg-info/10 text-info" />
        <StatCard title="Pending" value={formatCurrency(stats.pending)} icon={<Wallet className="h-4 w-4" />} iconClassName="bg-warning/10 text-warning" />
      </div>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search expenses..."
          containerClassName="w-64"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-8 w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <div className="p-4">
        <DataTable
          columns={expenseCols({ onEdit: openEdit, onDelete: (e) => setDeleteId(e.id) })}
          data={filtered}
          keyField={(e) => e.id}
        />
      </div>

      <Modal open={open} onOpenChange={setOpen} title={edit ? 'Edit Expense' : 'Add Expense'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Description *</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Shop rent — Main Street" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Amount (₹) *</Label>
              <Input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{edit ? 'Save Changes' : 'Add Expense'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete expense?"
        description="This expense will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteExpense(deleteId)}
      />
    </div>
  )
}

function expenseCols(ctx: { onEdit: (e: Expense) => void; onDelete: (e: Expense) => void }): Column<Expense>[] {
  return [
    { key: 'date', header: 'Date', render: (e) => <span className="text-muted-foreground">{formatDate(e.date)}</span> },
    { key: 'category', header: 'Category', render: (e) => <Badge variant="secondary">{e.category}</Badge> },
    { key: 'description', header: 'Description', render: (e) => <span className="font-medium">{e.description}</span> },
    { key: 'amount', header: 'Amount', className: 'text-right', render: (e) => <span className="font-semibold tabular">{formatCurrency(e.amount)}</span> },
    { key: 'method', header: 'Payment', render: (e) => <span className="text-xs capitalize text-muted-foreground">{e.paymentMethod}</span> },
    { key: 'status', header: 'Status', render: (e) => <Badge variant={e.status === 'paid' ? 'success' : 'warning'}>{e.status}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'w-14',
      render: (e) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-md p-1.5 hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => ctx.onEdit(e)}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => ctx.onDelete(e)} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
