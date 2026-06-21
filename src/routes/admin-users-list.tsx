import { useState, type FormEvent } from 'react'
import { AlertCircle, Loader2, Pencil, Trash2, X, ShieldCheck, ShieldHalf, User2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserAvatar } from '@/components/user-avatar'
import { useDeleteUser, useUpdateUser, useUsers } from '@/lib/api-users'
import { useCurrentUser } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import type { AdminUser, UpdateUserInput } from '@/types/admin-user'
import type { UserRole } from '@/types/auth'

const ROLE_OPTIONS: { value: UserRole; label: string; icon: typeof ShieldCheck }[] = [
  { value: 'admin', label: 'Admin', icon: ShieldCheck },
  { value: 'supervisor', label: 'Supervisor', icon: ShieldHalf },
  { value: 'usuario', label: 'Usuario', icon: User2 },
]

export default function AdminUsersList() {
  const { data, isPending, isError, error, refetch } = useUsers()
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState<AdminUser | null>(null)
  const currentUser = useCurrentUser()

  const activeUsers = data?.filter((u) => u.status !== 'eliminado') ?? []
  const deletedCount = (data?.length ?? 0) - activeUsers.length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Usuarios</h2>
        <p className="text-sm text-muted-foreground">
          {activeUsers.length} usuario{activeUsers.length === 1 ? '' : 's'} activo{activeUsers.length === 1 ? '' : 's'}
          {deletedCount > 0 && ` · ${deletedCount} eliminado${deletedCount === 1 ? '' : 's'}`}
        </p>
      </div>

      {isPending && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <Card className="border-destructive/40">
          <CardContent className="py-6 flex items-center gap-3 text-sm">
            <AlertCircle className="size-5 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="font-medium">No se pudieron cargar los usuarios.</p>
              <p className="text-muted-foreground">{(error as Error)?.message}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {data && data.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aún no hay usuarios.
          </CardContent>
        </Card>
      )}

      {data && data.length > 0 && (
        <div className="grid gap-2">
          {data.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              isSelf={currentUser?.id === u.id}
              onEdit={() => setEditing(u)}
              onDelete={() => setDeleting(u)}
            />
          ))}
        </div>
      )}

      {editing && <EditUserModal user={editing} onClose={() => setEditing(null)} />}
      {deleting && <DeleteUserModal user={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}

function UserRow({
  user,
  isSelf,
  onEdit,
  onDelete,
}: {
  user: AdminUser
  isSelf: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const isDeleted = user.status === 'eliminado'
  return (
    <Card className={cn(isDeleted && 'opacity-50')}>
      <CardContent className="p-4 flex items-center gap-3">
        <UserAvatar
          photoUrl={user.photoUrl}
          name={user.name}
          className="size-11"
          fallbackClassName="bg-primary/10 text-primary text-sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate">
              {user.name}
              {user.lastName ? ` ${user.lastName}` : ''}
              {isSelf && <span className="ml-2 text-xs text-muted-foreground">(tú)</span>}
            </p>
            <StatusBadge status={user.status} />
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {user.roles.map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={onEdit}
            disabled={isDeleted}
            title="Editar"
          >
            <Pencil />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            disabled={isSelf || isDeleted}
            title={isSelf ? 'No puedes eliminarte' : 'Eliminar'}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    admin: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30',
    supervisor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 ring-blue-500/30',
    usuario: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 ring-slate-500/30',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ring-1 ring-inset uppercase tracking-wide',
        styles[role],
      )}
    >
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    activo: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
    suspendido: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 ring-yellow-500/30',
    eliminado: 'bg-red-500/15 text-red-700 dark:text-red-300 ring-red-500/30',
  }
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ring-1 ring-inset',
        styles[status] ?? styles.activo,
      )}
    >
      {label}
    </span>
  )
}

function EditUserModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const update = useUpdateUser()
  const currentUser = useCurrentUser()
  const isSelf = currentUser?.id === user.id

  const [name, setName] = useState(user.name)
  const [lastName, setLastName] = useState(user.lastName ?? '')
  const [roles, setRoles] = useState<UserRole[]>(user.roles)
  const [status, setStatus] = useState<'activo' | 'suspendido'>(
    user.status === 'suspendido' ? 'suspendido' : 'activo',
  )

  function toggleRole(role: UserRole) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const input: UpdateUserInput = {
      name,
      lastName: lastName || undefined,
      roles,
      status,
    }
    try {
      await update.mutateAsync({ id: user.id, input })
      onClose()
    } catch {
      // El error queda en update.error, se muestra abajo
    }
  }

  const errorMessage = (() => {
    const err = update.error as { response?: { data?: { message?: string | string[] } } } | null
    const msg = err?.response?.data?.message
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null
  })()

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card text-card-foreground shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-200">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold">Editar usuario</h2>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2 -mt-2">
            <X />
          </Button>
        </header>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="flex gap-2 flex-wrap">
              {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => {
                const active = roles.includes(value)
                const disabled = isSelf && value === 'admin' && active
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => !disabled && toggleRole(value)}
                    disabled={disabled}
                    title={disabled ? 'No puedes quitarte el rol admin' : ''}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold ring-1 ring-inset transition',
                      active
                        ? 'bg-primary text-primary-foreground ring-primary'
                        : 'bg-muted text-muted-foreground ring-border hover:bg-muted/70',
                      disabled && 'opacity-60 cursor-not-allowed',
                    )}
                  >
                    <Icon className="size-3.5" /> {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <div className="flex gap-2">
              {(['activo', 'suspendido'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-md text-sm font-medium ring-1 ring-inset transition',
                    status === s
                      ? 'bg-primary text-primary-foreground ring-primary'
                      : 'bg-muted text-muted-foreground ring-border hover:bg-muted/70',
                  )}
                >
                  {s === 'activo' ? 'Activo' : 'Suspendido'}
                </button>
              ))}
            </div>
          </div>

          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={update.isPending || roles.length === 0} className="flex-1">
              {update.isPending && <Loader2 className="animate-spin" />} Guardar
            </Button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  )
}

function DeleteUserModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const del = useDeleteUser()

  async function handleDelete() {
    try {
      await del.mutateAsync(user.id)
      onClose()
    } catch {
      // Error visible abajo
    }
  }

  const errorMessage = (() => {
    const err = del.error as { response?: { data?: { message?: string | string[] } } } | null
    const msg = err?.response?.data?.message
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null
  })()

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card text-card-foreground shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-200">
        <header className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
            <Trash2 className="size-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold">Eliminar usuario</h2>
            <p className="text-sm text-muted-foreground">
              Esta acción marca al usuario como eliminado y revoca sus sesiones. Sus inscripciones a partidos quedan en
              la base de datos pero no podrá volver a iniciar sesión.
            </p>
          </div>
        </header>

        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium">{user.name}{user.lastName ? ` ${user.lastName}` : ''}</p>
          <p className="text-muted-foreground text-xs">{user.email}</p>
        </div>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={del.isPending} className="flex-1">
            {del.isPending && <Loader2 className="animate-spin" />} Eliminar
          </Button>
        </div>
      </div>
    </ModalBackdrop>
  )
}

function ModalBackdrop({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
