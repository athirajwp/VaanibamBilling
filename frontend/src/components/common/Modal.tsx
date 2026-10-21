import * as React from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  className?: string
  children: React.ReactNode
}

export function Modal({ open, onOpenChange, title, className, children }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('p-0 gap-0', className)}>
        {title && (
          <div className="border-b px-5 py-3.5">
            <DialogTitle className="text-base">{title}</DialogTitle>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
