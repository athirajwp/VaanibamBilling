import { useMemo, useState } from 'react'
import { Banknote, Smartphone, CreditCard, Landmark, BookUser } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

export const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'bank', label: 'Bank Transfer', icon: Landmark },
  { id: 'credit', label: 'Credit', icon: BookUser },
] as const

export type PaymentMethodId = (typeof paymentMethods)[number]['id']

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  grandTotal: number
  onComplete: (method: string, amount: number) => void
}

export function PaymentModal({ open, onOpenChange, grandTotal, onComplete }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethodId>('cash')
  const [amount, setAmount] = useState<string>(String(grandTotal))

  const received = useMemo(() => Number(amount) || 0, [amount])
  const balance = Math.max(0, received - grandTotal)
  const due = Math.max(0, grandTotal - received)

  const reset = () => {
    setMethod('cash')
    setAmount(String(grandTotal))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (o) reset()
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
          <DialogDescription>Collect payment to complete this sale.</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted px-4 py-3">
          <p className="text-xs text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-bold tabular tracking-tight">{formatCurrency(grandTotal)}</p>
        </div>

        <div>
          <Label className="mb-2 block">Payment Method</Label>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((pm) => {
              const Icon = pm.icon
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setMethod(pm.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors',
                    method === pm.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'hover:bg-muted',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {pm.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Amount Received</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
            <Input
              type="number"
              min={0}
              value={amount}
              autoFocus
              onChange={(e) => setAmount(e.target.value)}
              className="pl-7 text-lg font-semibold tabular"
            />
          </div>
        </div>

        {method === 'credit' ? (
          <div className="rounded-md bg-warning/10 px-3 py-2 text-xs text-warning">
            Amount will be added to the customer's outstanding balance.
          </div>
        ) : (
          <div className="flex justify-between rounded-md bg-muted/60 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Change / Balance</span>
            <span className={cn('font-semibold tabular', balance > 0 ? 'text-success' : 'text-muted-foreground')}>
              {balance > 0 ? formatCurrency(balance) : formatCurrency(due) + ' due'}
            </span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="lg"
            disabled={received <= 0 && method !== 'credit'}
            onClick={() => onComplete(method, Math.min(received, grandTotal))}
          >
            Complete Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
