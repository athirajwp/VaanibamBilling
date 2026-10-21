import { useMemo } from 'react'
import { todayISO, daysAgoISO } from '@/lib/format'
import type { DateRange } from '@/services/reportService'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function useDateRangePresets() {
  return useMemo(() => {
    const today = todayISO()
    const weekStart = daysAgoISO(6)
    const monthStart = daysAgoISO(29)
    return {
      today: { from: today, to: today },
      week: { from: weekStart, to: today },
      month: { from: monthStart, to: today },
    }
  }, [])
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const presets = useDateRangePresets()

  const preset = value.from === presets.today.from && value.to === presets.today.to
    ? 'today'
    : value.from === presets.week.from
      ? 'week'
      : value.from === presets.month.from
        ? 'month'
        : 'custom'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select
        value={preset}
        onValueChange={(v) => {
          if (v !== 'custom') onChange(presets[v as keyof typeof presets])
        }}
      >
        <SelectTrigger className="h-8 w-[130px]">
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
      {preset === 'custom' && (
        <>
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="date"
              className="h-8 w-[140px]"
              value={value.from}
              onChange={(e) => onChange({ ...value, from: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              type="date"
              className="h-8 w-[140px]"
              value={value.to}
              onChange={(e) => onChange({ ...value, to: e.target.value })}
            />
          </div>
        </>
      )}
    </div>
  )
}
