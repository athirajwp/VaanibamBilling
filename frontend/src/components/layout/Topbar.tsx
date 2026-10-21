import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, ChevronDown, HelpCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchCommand } from './SearchCommand'
import { NotificationsDropdown } from './NotificationsDropdown'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { initials } from '@/lib/format'
import { toast } from '@/stores/useToastStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { shortcuts } from './navigation'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const business = useBusinessStore((s) => s.business)

  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      handler: (e) => {
        e.preventDefault()
        setSearchOpen(true)
      },
    },
    {
      key: 'Escape',
      handler: () => setSearchOpen(false),
      enabled: searchOpen,
    },
  ])

  const pageTitle = pageTitleFor(location.pathname)

  return (
    <header className="no-print flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
      <div className="hidden min-w-0 items-center gap-1.5 md:flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium hover:bg-muted">
              <span className="max-w-[180px] truncate">{business.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Switch business</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => toast.info('Business switched', 'Sri Lakshmi Crackers')}>
              🏪 Sri Lakshmi Crackers
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings/business')}>
              <Settings className="h-4 w-4" /> Business settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-xs text-muted-foreground">{pageTitle}</span>
      </div>

      <button
        onClick={() => setSearchOpen(true)}
        className="ml-auto flex h-8 w-full max-w-md items-center gap-2 rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 truncate text-left">Search products, customers, invoices...</span>
        <kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1 md:ml-2">
        <Button variant="ghost" size="icon" title="Help" onClick={() => setHelpOpen(true)}>
          <HelpCircle className="h-4.5 w-4.5" />
        </Button>
        <NotificationsDropdown />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials('Athi Krishnan')}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium leading-tight">Athi Krishnan</p>
                <p className="text-[10px] text-muted-foreground">Owner</p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">Athi Krishnan</p>
              <p className="text-xs text-muted-foreground">athi@bizflow.local</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info('Signed out (demo)', 'Authentication comes with the backend phase.')}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </header>
  )
}

function HelpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Speed up your billing workflow.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          {shortcuts.map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <div>
                <p className="text-sm font-medium">{s.action}</p>
                <p className="text-[11px] text-muted-foreground">{s.hint}</p>
              </div>
              <kbd className="rounded border bg-background px-2 py-1 text-[11px] font-semibold">{s.label}</kbd>
            </div>
          ))}
        </div>
        <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          You can also press <kbd className="rounded border bg-background px-1">Ctrl K</kbd> anywhere to search.
        </div>
      </DialogContent>
    </Dialog>
  )
}

function pageTitleFor(path: string): string {
  const map: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/billing': 'New Sale',
    '/sales': 'Sales',
    '/sales/invoices': 'Invoices',
    '/sales/quotations': 'Quotations',
    '/sales/returns': 'Sales Returns',
    '/purchases': 'Purchases',
    '/purchases/bills': 'Purchase Bills',
    '/purchases/returns': 'Purchase Returns',
    '/products': 'Products',
    '/products/list': 'Products List',
    '/products/categories': 'Categories',
    '/inventory': 'Inventory',
    '/inventory/stock': 'Stock',
    '/inventory/adjustments': 'Adjustments',
    '/inventory/godowns': 'Godowns',
    '/customers': 'Customers',
    '/customers/list': 'Customers List',
    '/customers/ledger': 'Customer Ledger',
    '/suppliers': 'Suppliers',
    '/suppliers/list': 'Suppliers List',
    '/suppliers/ledger': 'Supplier Ledger',
    '/expenses': 'Expenses',
    '/reports': 'Reports',
    '/reports/sales': 'Sales Report',
    '/reports/purchases': 'Purchase Report',
    '/reports/profit': 'Profit & Loss',
    '/reports/inventory': 'Inventory Report',
    '/reports/customers': 'Customer Report',
    '/reports/gst': 'GST Report',
    '/online-store': 'Online Store',
    '/settings': 'Settings',
    '/settings/business': 'Business Settings',
    '/settings/invoice': 'Invoice Settings',
    '/settings/users': 'Users',
    '/settings/printer': 'Printer',
    '/settings/taxes': 'Taxes',
  }
  if (path.startsWith('/sales/invoices/')) return 'Invoice'
  if (path.startsWith('/customers/')) return 'Customer'
  if (path.startsWith('/suppliers/')) return 'Supplier'
  if (path.startsWith('/purchases/new')) return 'New Purchase Bill'
  return map[path] ?? 'BizFlow'
}
