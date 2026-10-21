import { Link, useLocation } from 'react-router-dom'
import { Building2, FileText, Users, Printer, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Business', path: '/settings/business', icon: Building2 },
  { label: 'Invoice', path: '/settings/invoice', icon: FileText },
  { label: 'Users', path: '/settings/users', icon: Users },
  { label: 'Printer', path: '/settings/printer', icon: Printer },
  { label: 'Taxes', path: '/settings/taxes', icon: Wallet },
]

export function SettingsTabs() {
  const location = useLocation()
  return (
    <div className="flex flex-wrap gap-1 border-b bg-card px-4 py-2">
      {tabs.map((t) => {
        const Icon = t.icon
        const active = location.pathname === t.path
        return (
          <Link
            key={t.path}
            to={t.path}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" /> {t.label}
          </Link>
        )
      })}
    </div>
  )
}
