import * as React from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  side?: 'right' | 'left'
  className?: string
  children: React.ReactNode
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  side = 'right',
  className,
  children,
}: DrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'top-0 h-[100dvh] max-w-md -translate-y-0 overflow-y-auto rounded-none border-y-0 p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          side === 'right'
            ? 'right-0 left-auto translate-x-0 sm:rounded-l-lg border-r-0'
            : 'left-0 right-auto translate-x-0 sm:rounded-r-lg border-l-0',
          className,
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between border-b px-5 py-4">
            <div>
              <DialogTitle className="text-base">{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-0.5 text-xs">{description}</DialogDescription>
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
