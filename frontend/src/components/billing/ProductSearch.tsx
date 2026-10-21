import { useMemo, useRef, useState } from 'react'
import { ScanBarcode, PackageSearch } from 'lucide-react'
import { useProductStore } from '@/stores/useProductStore'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ProductSearchProps {
  onSelect: (product: Product) => void
  autoFocus?: boolean
}

export function ProductSearch({ onSelect, autoFocus }: ProductSearchProps) {
  const products = useProductStore((s) => s.products)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode ?? '').includes(q),
    )
    return filtered.slice(0, 8)
  }, [query, products])

  const submit = (product: Product) => {
    onSelect(product)
    setQuery('')
    setOpen(false)
    setTimeout(() => inputRef.current?.focus(), 10)
  }

  return (
    <div className="relative flex-1">
      <div className="relative">
        <ScanBarcode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          id="billing-search-input"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) {
              submit(results[0])
            }
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder="Search product or scan barcode...  (F2)"
          className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {open && query.trim() && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
              <PackageSearch className="h-6 w-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                No product found for “{query}”
              </p>
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onMouseDown={() => submit(p)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent',
                      p.currentStock <= 0 && 'opacity-50',
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {p.sku} · Stock: {p.currentStock} {p.unit}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular">{formatCurrency(p.sellingPrice)}</p>
                      {p.gstRate > 0 && (
                        <p className="text-[10px] text-muted-foreground">GST {p.gstRate}%</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
