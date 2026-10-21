import type { PaymentStatus, StockStatus } from '@/types'
import { Badge } from '@/components/ui/badge'

const paymentMap: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' | 'muted' }> = {
  paid: { label: 'Paid', variant: 'success' },
  partial: { label: 'Partial', variant: 'warning' },
  pending: { label: 'Pending', variant: 'muted' },
}

const stockMap: Record<StockStatus, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  healthy: { label: 'Healthy', variant: 'success' },
  low: { label: 'Low Stock', variant: 'warning' },
  out: { label: 'Out of Stock', variant: 'destructive' },
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = paymentMap[status]
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const cfg = stockMap[status]
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function DocumentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'info' | 'muted' | 'default' }> = {
    completed: { label: 'Completed', variant: 'success' },
    draft: { label: 'Draft', variant: 'muted' },
    held: { label: 'Held', variant: 'warning' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
    sent: { label: 'Sent', variant: 'info' },
    accepted: { label: 'Accepted', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    expired: { label: 'Expired', variant: 'muted' },
    converted: { label: 'Converted', variant: 'info' },
    paid: { label: 'Paid', variant: 'success' },
    partial: { label: 'Partial', variant: 'warning' },
    pending: { label: 'Pending', variant: 'muted' },
    online: { label: 'Online', variant: 'success' },
    offline: { label: 'Offline', variant: 'muted' },
  }
  const cfg = map[status] ?? { label: status, variant: 'muted' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function BoolBadge({ value, yes = 'Active', no = 'Inactive' }: { value: boolean; yes?: string; no?: string }) {
  return value ? (
    <Badge variant="success">{yes}</Badge>
  ) : (
    <Badge variant="muted">{no}</Badge>
  )
}
