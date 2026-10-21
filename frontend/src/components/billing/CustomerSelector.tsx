import { Users, UserPlus, ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { cn } from '@/lib/utils'
import { CustomerForm } from '@/components/customers/CustomerForm'

interface CustomerSelectorProps {
  value: string
  onChange: (customerId: string) => void
}

export function CustomerSelector({ value, onChange }: CustomerSelectorProps) {
  const customers = useCustomerStore((s) => s.customers)
  const selected = customers.find((c) => c.id === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-10 items-center gap-2 rounded-lg border bg-card px-3 text-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="max-w-[180px] truncate font-medium">
            {selected?.name ?? 'Select Customer'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Users className="h-4 w-4" /> Select Customer
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-56 overflow-y-auto">
          <DropdownMenuItem
            onClick={() => onChange('c-001')}
            className={cn(value === 'c-001' && 'bg-accent font-medium')}
          >
            <span className="flex-1">Walk-in Customer</span>
            {value === 'c-001' && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          {customers
            .filter((c) => c.id !== 'c-001' && c.status === 'active')
            .map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => onChange(c.id)}
                className={cn(value === c.id && 'bg-accent font-medium')}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.phone || 'No phone'}</p>
                </div>
                {value === c.id && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
        </div>
        <DropdownMenuSeparator />
        <CustomerForm
          triggerLabel={
            <span className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-primary">
              <UserPlus className="h-4 w-4" /> Add New Customer
            </span>
          }
          onSaved={(customer) => onChange(customer.id)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
