import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupplierStore } from '@/stores/useSupplierStore'
import type { Supplier } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Supplier name is required'),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  gstin: z.string().optional().or(z.literal('')),
  openingBalance: z.coerce.number().optional(),
})

type FormValues = z.infer<typeof schema>

interface SupplierFormProps {
  triggerLabel: React.ReactNode
  supplier?: Supplier
  onSaved?: (supplier: Supplier) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SupplierForm({ triggerLabel, supplier, onSaved, open: controlledOpen, onOpenChange }: SupplierFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (o: boolean) => {
    setInternalOpen(o)
    onOpenChange?.(o)
  }
  const addSupplier = useSupplierStore((s) => s.addSupplier)
  const updateSupplier = useSupplierStore((s) => s.updateSupplier)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: supplier
      ? {
          name: supplier.name,
          phone: supplier.phone ?? '',
          email: supplier.email ?? '',
          address: supplier.address ?? '',
          gstin: supplier.gstin ?? '',
          openingBalance: supplier.openingBalance ?? 0,
        }
      : { name: '', phone: '', email: '', address: '', gstin: '', openingBalance: 0 },
  })

  const onSubmit = (values: FormValues) => {
    if (supplier) {
      updateSupplier(supplier.id, { ...values, status: supplier.status })
      onSaved?.({ ...supplier, ...values })
    } else {
      const created = addSupplier({ ...values, openingBalance: values.openingBalance ?? 0, status: 'active' })
      onSaved?.(created)
    }
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="w-full" onClick={() => reset()}>
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
          <DialogDescription>Fill in the supplier details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Supplier Name *</Label>
            <Input placeholder="Sri Lakshmi Fireworks Factory" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input placeholder="99441 22334" {...register('phone')} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input placeholder="supplier@email.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Address</Label>
            <Input placeholder="GST Road, Sivakasi" {...register('address')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>GSTIN</Label>
              <Input placeholder="33AABCSL1234F1Z1" {...register('gstin')} />
            </div>
            <div className="grid gap-2">
              <Label>Opening Balance</Label>
              <Input type="number" placeholder="0" {...register('openingBalance')} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">{supplier ? 'Save Changes' : 'Add Supplier'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
