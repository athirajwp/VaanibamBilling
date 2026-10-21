import * as React from 'react'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string
  change?: number
  icon?: React.ReactNode
  iconClassName?: string
  hint?: string
  onClick?: () => void
}

export function StatCard({ title, value, change, icon, iconClassName, hint, onClick }: StatCardProps) {
  const positive = (change ?? 0) >= 0
  return (
    <Card
      className={cn(
        'p-4 transition-shadow hover:shadow-md',
        onClick && 'cursor-pointer hover:border-primary/40',
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-1.5 truncate text-xl font-bold tabular tracking-tight">{value}</p>
          <div className="mt-1.5 flex items-center gap-1">
            {change !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded px-1 py-px text-[11px] font-medium',
                  positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
                )}
              >
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {positive ? '+' : ''}
                {change}%
              </span>
            )}
            {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
            {onClick && <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />}
          </div>
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              iconClassName ?? 'bg-primary/10 text-primary',
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
