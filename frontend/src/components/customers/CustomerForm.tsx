import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCustomerStore } from '@/stores/useCustomerStore'
import type { Customer } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  gstin: z.string().optional().or(z.literal('')),
  creditLimit: z.coerce.number().min(0).optional(),
  openingBalance: z.coerce.number().optional(),
})

type FormValues = z.infer<typeof schema>

interface CustomerFormProps {
  triggerLabel: React.ReactNode
  customer?: Customer
  onSaved?: (customer: Customer) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CustomerForm({ triggerLabel, customer, onSaved, open: controlledOpen, onOpenChange }: CustomerFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (o: boolean) => {
    setInternalOpen(o)
    onOpenChange?.(o)
  }
  const addCustomer = useCustomerStore((s) => s.addCustomer)
  const updateCustomer = useCustomerStore((s) => s.updateCustomer)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: customer
      ? {
          name: customer.name,
          phone: customer.phone ?? '',
          email: customer.email ?? '',
          address: customer.address ?? '',
          gstin: customer.gstin ?? '',
          creditLimit: customer.creditLimit ?? 0,
          openingBalance: customer.openingBalance ?? 0,
        }
      : {
          name: '',
          phone: '',
          email: '',
          address: '',
          gstin: '',
          creditLimit: 0,
          openingBalance: 0,
        },
  })

  const onSubmit = (values: FormValues) => {
    if (customer) {
      updateCustomer(customer.id, { ...values, status: customer.status })
      onSaved?.({ ...customer, ...values })
    } else {
      const created = addCustomer({
        ...values,
        creditLimit: values.creditLimit ?? 0,
        openingBalance: values.openingBalance ?? 0,
        status: 'active',
      })
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
      </DialogTrigger>      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogDescription>
            Fill in the customer details below. Fields marked * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Name *</Label>
            <Input placeholder="Kumar Stores" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input placeholder="98422 11223" {...register('phone')} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input placeholder="store@email.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Address</Label>
            <Input placeholder="Main Road, City, Tamil Nadu" {...register('address')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>GSTIN</Label>
              <Input placeholder="33AABCK1234F1Z5" {...register('gstin')} />
            </div>
            <div className="grid gap-2">
              <Label>Credit Limit</Label>
              <Input type="number" placeholder="50000" {...register('creditLimit')} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Opening Balance</Label>
            <Input type="number" placeholder="0" {...register('openingBalance')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{customer ? 'Save Changes' : 'Add Customer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
