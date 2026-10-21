import { useState } from 'react'
import { Users, Save, Pencil, Trash2, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/common/Modal'
import { SettingsTabs } from '@/components/settings/SettingsTabs'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { toast } from '@/stores/useToastStore'
import type { User } from '@/types'

const roles: User['role'][] = ['Owner', 'Admin', 'Manager', 'Accountant', 'Cashier', 'Staff']
const permissionOptions = ['billing', 'products', 'customers', 'inventory', 'purchases', 'expenses', 'reports']

const emptyUser: User = {
  id: '',
  name: '',
  email: '',
  phone: '',
  role: 'Staff',
  status: 'active',
  permissions: ['billing'],
}

export function UsersSettingsPage() {
  const users = useSettingsStore((s) => s.settings.users)
  const saveUsers = useSettingsStore((s) => s.saveUsers)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<User>(emptyUser)

  const openAdd = () => {
    setEditingId(null)
    setForm({ ...emptyUser })
    setModalOpen(true)
  }

  const openEdit = (u: User) => {
    setEditingId(u.id)
    setForm({ ...u })
    setModalOpen(true)
  }

  const save = () => {
    if (!form.name.trim()) {
      toast.error('Name required', 'Enter a user name to continue.')
      return
    }
    const next = editingId
      ? users.map((u) => (u.id === editingId ? { ...form } : u))
      : [...users, { ...form, id: form.id || `u-${Date.now()}` }]
    saveUsers(next)
    toast.success('User saved', `${form.name} updated.`)
    setModalOpen(false)
  }

  const toggleStatus = (u: User) => {
    saveUsers(users.map((x) => (x.id === u.id ? { ...x, status: x.status === 'active' ? 'inactive' : 'active' } : x)))
  }

  const remove = (u: User) => {
    saveUsers(users.filter((x) => x.id !== u.id))
    toast.success('User removed', `${u.name} deleted.`)
  }

  const togglePermission = (perm: string) => {
    const perms = form.permissions.includes(perm)
      ? form.permissions.filter((p) => p !== perm)
      : [...form.permissions, perm]
    setForm({ ...form, permissions: perms })
  }

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        description="Manage who can access BizFlow and what they can do"
        icon={<Users className="h-5 w-5" />}
      >
        <Button size="sm" onClick={openAdd}>
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </PageHeader>
      <SettingsTabs />

      <div className="mx-auto max-w-3xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <Badge variant="outline">{u.role}</Badge>
                    <Badge variant={u.status === 'active' ? 'success' : 'muted'}>
                      {u.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{u.email || 'No email'} · {u.permissions.join(', ') || 'No access'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="iconSm" onClick={() => toggleStatus(u)}>
                    <span className="text-xs">{u.status === 'active' ? 'Disable' : 'Enable'}</span>
                  </Button>
                  <Button variant="ghost" size="iconSm" onClick={() => openEdit(u)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="iconSm" onClick={() => remove(u)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingId ? 'Edit User' : 'Add User'}
      >
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as User['role'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as User['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Permissions</Label>
            <div className="flex flex-wrap gap-2">
              {permissionOptions.map((p) => {
                const on = form.permissions.includes(p)
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePermission(p)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                      on ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={save}>
            <Save className="h-4 w-4" /> Save
          </Button>
        </div>
      </Modal>
    </div>
  )
}
