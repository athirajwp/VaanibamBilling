import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Package, Users, Truck, FileText, ClipboardList, CornerDownLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useProductStore } from '@/stores/useProductStore'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { useSupplierStore } from '@/stores/useSupplierStore'
import { useInvoiceStore } from '@/stores/useInvoiceStore'
import { formatCurrency } from '@/lib/format'

interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const products = useProductStore((s) => s.products)
  const customers = useCustomerStore((s) => s.customers)
  const suppliers = useSupplierStore((s) => s.suppliers)
  const invoices = useInvoiceStore((s) => s.invoices)
  const quotations = useInvoiceStore((s) => s.quotations)

  const q = query.trim().toLowerCase()

  const results = useMemo(() => {
    if (!q) return null
    const match = (s: string) => s.toLowerCase().includes(q)
    return {
      products: products.filter((p) => match(p.name) || match(p.sku) || match(p.barcode ?? '')).slice(0, 5),
      customers: customers.filter((c) => match(c.name) || match(c.phone ?? '')).slice(0, 4),
      suppliers: suppliers.filter((s) => match(s.name) || match(s.phone ?? '')).slice(0, 4),
      invoices: invoices.filter((i) => match(i.invoiceNumber) || match(i.customerName)).slice(0, 5),
      quotations: quotations.filter((q2) => match(q2.quotationNumber) || match(q2.customerName)).slice(0, 3),
    }
  }, [q, products, customers, suppliers, invoices, quotations])

  const isEmpty = results && [...Object.values(results)].every((arr) => arr.length === 0)

  const go = (path: string) => {
    navigate(path)
    onOpenChange(false)
    setQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setQuery('') }}>
      <DialogContent className="top-24 top-1/4 max-w-xl p-0 translate-y-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Global search</DialogTitle>
          <DialogDescription>Search products, customers, suppliers, invoices and quotations.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, customers, invoices..."
            className="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!results && (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              Type to search across products, customers, suppliers, invoices &amp; quotations.
            </p>
          )}
          {isEmpty && (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              No results found for “{query}”.
            </p>
          )}
          {results?.products.length ? (
            <Group label="Products" icon={<Package className="h-3.5 w-3.5" />}>
              {results.products.map((p) => (
                <Row key={p.id} onClick={() => go('/products/list')}>
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-muted text-[10px] font-bold">
                    {p.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{p.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {p.sku} · {formatCurrency(p.sellingPrice)}
                    </span>
                  </span>
                  <BadgeLabel>{p.category}</BadgeLabel>
                </Row>
              ))}
            </Group>
          ) : null}
          {results?.customers.length ? (
            <Group label="Customers" icon={<Users className="h-3.5 w-3.5" />}>
              {results.customers.map((c) => (
                <Row key={c.id} onClick={() => go(`/customers/list`)}>
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                    {c.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{c.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{c.phone || 'No phone'}</span>
                  </span>
                </Row>
              ))}
            </Group>
          ) : null}
          {results?.suppliers.length ? (
            <Group label="Suppliers" icon={<Truck className="h-3.5 w-3.5" />}>
              {results.suppliers.map((s) => (
                <Row key={s.id} onClick={() => go('/suppliers/list')}>
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-muted text-[10px] font-bold">
                    {s.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{s.name}</span>
                </Row>
              ))}
            </Group>
          ) : null}
          {results?.invoices.length ? (
            <Group label="Invoices" icon={<FileText className="h-3.5 w-3.5" />}>
              {results.invoices.map((inv) => (
                <Row key={inv.id} onClick={() => go(`/sales/invoices/${inv.id}`)}>
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-muted text-[10px] font-bold">
                    {inv.invoiceNumber.slice(-3)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{inv.invoiceNumber}</span>
                    <span className="block text-[11px] text-muted-foreground">{inv.customerName}</span>
                  </span>
                  <BadgeLabel>{formatCurrency(inv.grandTotal)}</BadgeLabel>
                </Row>
              ))}
            </Group>
          ) : null}
          {results?.quotations.length ? (
            <Group label="Quotations" icon={<ClipboardList className="h-3.5 w-3.5" />}>
              {results.quotations.map((q2) => (
                <Row key={q2.id} onClick={() => go('/sales/quotations')}>
                  <span className="min-w-0 flex-1 truncate text-sm">{q2.quotationNumber}</span>
                  <span className="text-[11px] text-muted-foreground">{q2.customerName}</span>
                </Row>
              ))}
            </Group>
          ) : null}
        </div>
        <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> to open
          </span>
          <span>Esc to close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Group({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function Row({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left transition-colors hover:bg-accent"
    >
      {children}
    </button>
  )
}

function BadgeLabel({ children }: { children: React.ReactNode }) {
  return <span className="shrink-0 text-[11px] text-muted-foreground">{children}</span>
}
