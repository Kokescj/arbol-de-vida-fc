import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Loader2, LogOut, Save, UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCurrentUser, useLogout } from '@/hooks/use-auth'
import {
  useProfile,
  useUpdateProfile,
  useUploadProfilePhoto,
} from '@/lib/api-profile'
import { resolveAssetUrl } from '@/lib/assets'
import { cn } from '@/lib/utils'

interface FormState {
  name: string
  lastName: string
  jerseyName: string
  preferredNumber: string
}

export default function PerfilPage() {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const logout = useLogout()
  const { data: profile, isPending, isError, error } = useProfile()
  const update = useUpdateProfile()
  const upload = useUploadProfilePhoto()
  const fileInput = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>({
    name: '',
    lastName: '',
    jerseyName: '',
    preferredNumber: '',
  })

  // Sincronizar form cuando llega el perfil (o se actualiza tras un save).
  useEffect(() => {
    if (!profile) return
    setForm({
      name: profile.name ?? '',
      lastName: profile.lastName ?? '',
      jerseyName: profile.jerseyName ?? '',
      preferredNumber: profile.preferredNumber?.toString() ?? '',
    })
  }, [profile])

  const isAdmin = currentUser?.roles.some((r) => r === 'admin' || r === 'supervisor')
  const backHref = isAdmin ? '/admin' : '/partido-activo'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await update.mutateAsync({
      name: form.name.trim(),
      lastName: form.lastName.trim() || undefined,
      jerseyName: form.jerseyName.trim() || undefined,
      preferredNumber: form.preferredNumber
        ? Number(form.preferredNumber)
        : undefined,
    })
  }

  async function handlePhotoSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // permite reseleccionar el mismo archivo después
    if (!file) return
    await upload.mutateAsync(file)
  }

  async function handleLogout() {
    await logout.mutateAsync()
    navigate('/login', { replace: true })
  }

  const updateError = (() => {
    const err = update.error as { response?: { data?: { message?: string | string[] } } } | null
    return err?.response?.data?.message ?? null
  })()
  const uploadError = (() => {
    const err = upload.error as { response?: { data?: { message?: string | string[] } } } | null
    return err?.response?.data?.message ?? null
  })()

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between gap-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to={backHref}>
              <ArrowLeft /> Volver
            </Link>
          </Button>
          <h1 className="text-base font-bold">Mi perfil</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut /> Salir
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        {isPending && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <Card className="border-destructive/40">
            <CardContent className="py-6 text-sm">
              <p className="font-medium">No se pudo cargar tu perfil.</p>
              <p className="text-muted-foreground">{(error as Error)?.message}</p>
            </CardContent>
          </Card>
        )}

        {profile && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <PhotoAvatar
                  src={resolveAssetUrl(profile.photoUrl)}
                  name={profile.name}
                  uploading={upload.isPending}
                />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {profile.name} {profile.lastName ?? ''}
                  </CardTitle>
                  <CardDescription className="truncate">{profile.email}</CardDescription>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rol: {profile.roles.join(', ')}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoSelected}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInput.current?.click()}
                  disabled={upload.isPending}
                >
                  {upload.isPending ? (
                    <>
                      <Loader2 className="animate-spin" /> Subiendo…
                    </>
                  ) : (
                    <>
                      <Camera /> Cambiar foto
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  JPG, PNG o WebP · máximo 5 MB
                </p>
                {uploadError && (
                  <p className="text-sm text-destructive text-center">
                    {Array.isArray(uploadError) ? uploadError.join(', ') : uploadError}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos del jugador</CardTitle>
                <CardDescription>
                  El nombre de camiseta y número aparecen en la plantilla del partido.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        required
                        maxLength={50}
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        disabled={update.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        maxLength={50}
                        value={form.lastName}
                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        disabled={update.isPending}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                    <div className="space-y-2">
                      <Label htmlFor="jerseyName">Nombre en la camiseta</Label>
                      <Input
                        id="jerseyName"
                        placeholder="KOKE"
                        maxLength={20}
                        value={form.jerseyName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, jerseyName: e.target.value.toUpperCase() }))
                        }
                        disabled={update.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredNumber">Número</Label>
                      <Input
                        id="preferredNumber"
                        type="number"
                        min={1}
                        max={99}
                        placeholder="10"
                        value={form.preferredNumber}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, preferredNumber: e.target.value }))
                        }
                        disabled={update.isPending}
                      />
                    </div>
                  </div>

                  {updateError && (
                    <p className="text-sm text-destructive">
                      {Array.isArray(updateError) ? updateError.join(', ') : updateError}
                    </p>
                  )}

                  {update.isSuccess && !update.isPending && (
                    <p className="text-sm text-primary">✓ Cambios guardados</p>
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" disabled={update.isPending} size="lg">
                      {update.isPending ? (
                        <>
                          <Loader2 className="animate-spin" /> Guardando…
                        </>
                      ) : (
                        <>
                          <Save /> Guardar cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}

function PhotoAvatar({
  src,
  name,
  uploading,
}: {
  src?: string
  name: string
  uploading?: boolean
}) {
  return (
    <div className="relative size-20 rounded-full overflow-hidden bg-muted shrink-0 ring-2 ring-primary/20">
      {src ? (
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <div className="size-full flex items-center justify-center">
          <UserCircle2 className="size-12 text-muted-foreground" />
        </div>
      )}
      {uploading && (
        <div className={cn('absolute inset-0 bg-black/50 flex items-center justify-center')}>
          <Loader2 className="size-6 animate-spin text-white" />
        </div>
      )}
    </div>
  )
}
