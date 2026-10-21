import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, PanelLeftClose, PanelLeft, ReceiptText } from 'lucide-react'
import { navItems } from './navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  return (
    <aside
      className={cn(
        'no-print flex h-full flex-col border-r bg-card transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ReceiptText className="h-4.5 w-4.5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight">BizFlow</p>
            <p className="truncate text-[10px] text-muted-foreground">Billing &amp; Inventory</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="iconSm"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            if (!item.children) {
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        collapsed && 'justify-center px-0',
                      )
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                </li>
              )
            }

            return (
              <li key={item.path}>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          cn(
                            'flex h-9 items-center justify-center rounded-md px-0 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          )
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                ) : (
                  <details
                    className="group"
                    open={item.children.some((c) => location.pathname.startsWith(c.path))}
                  >
                    <summary className="flex h-9 cursor-pointer list-none items-center gap-2.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="mt-0.5 space-y-0.5 pl-6">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon
                        return (
                          <li key={child.path}>
                            <NavLink
                              to={child.path}
                              className={({ isActive }) =>
                                cn(
                                  'flex h-8 items-center gap-2 rounded-md px-2 text-[13px] transition-colors',
                                  isActive
                                    ? 'bg-primary/10 font-medium text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )
                              }
                            >
                              <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{child.label}</span>
                            </NavLink>
                          </li>
                        )
                      })}
                    </ul>
                  </details>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="border-t px-3 py-3">
          <div className="rounded-lg bg-muted p-2.5 text-[11px] leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">Keyboard shortcuts</p>
            <p className="mt-0.5">F1 New Sale · F2 Search · F5 Payment · Esc Close</p>
          </div>
        </div>
      )}
    </aside>
  )
}
