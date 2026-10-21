import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useBusinessStore } from '@/stores/useBusinessStore'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const business = useBusinessStore((s) => s.business)

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <Topbar />
        <div className="flex min-h-0 flex-1">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
          <main className="scrollbar-thin min-w-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
        <footer className="no-print flex h-7 shrink-0 items-center justify-between border-t bg-card px-4 text-[10px] text-muted-foreground">
          <span>
            BizFlow v1.0.0 · {business.name}
          </span>
          <span>Simple Billing. Smart Business.</span>
        </footer>
      </div>
    </TooltipProvider>
  )
}
