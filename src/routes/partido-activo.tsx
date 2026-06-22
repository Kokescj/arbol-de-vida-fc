import { useEffect } from 'react'
import { LogOut, MapPin, Clock, Users, Loader2, Wifi, WifiOff, Calendar, UserCircle2, LayoutDashboard } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InstallButton } from '@/components/install-button'
import { MatchEnrollButton } from '@/components/match-enroll-button'
import { MatchHeroBoard } from '@/components/match-hero-board'
import { MatchStatusBadge } from '@/components/match-status-badge'
import { UserAvatar } from '@/components/user-avatar'
import { useCurrentUser, useLogout } from '@/hooks/use-auth'
import { useMatchRealtime, type RealtimeStatus } from '@/hooks/use-match-realtime'
import { useActiveMatch } from '@/lib/api-matches'
import { useProfile } from '@/lib/api-profile'
import { formatMatchDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function PartidoActivo() {
  const user = useCurrentUser()
  const { data: profile } = useProfile()
  const logout = useLogout()
  const navigate = useNavigate()
  const { data: match, isPending, isError, error, refetch } = useActiveMatch()
  const realtimeStatus = useMatchRealtime(match?.id)
  const isAdmin = user?.roles.some((r) => r === 'admin' || r === 'supervisor') ?? false

  // Pintamos html+body con el mismo verde oscuro del pitch para que el
  // overscroll de iOS Safari (cuando el contenido es más corto que la vista
  // o al hacer bounce) no muestre el blanco del body. Limpiamos al desmontar.
  useEffect(() => {
    const prevHtml = document.documentElement.style.backgroundColor
    const prevBody = document.body.style.backgroundColor
    document.documentElement.style.backgroundColor = '#050d09'
    document.body.style.backgroundColor = '#050d09'
    return () => {
      document.documentElement.style.backgroundColor = prevHtml
      document.body.style.backgroundColor = prevBody
    }
  }, [])

  async function handleLogout() {
    await logout.mutateAsync()
    navigate('/login', { replace: true })
  }

  return (
    <div className="dark min-h-svh bg-pitch-vignette text-foreground">
      <header className="border-b border-emerald-500/15 bg-black/40 backdrop-blur-md sticky top-0 z-20 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar
              photoUrl={profile?.photoUrl}
              name={profile?.name ?? user?.name}
              className="size-10"
              fallbackClassName="bg-lime-300/15 ring-1 ring-lime-300/30 text-lime-300 text-sm"
            />
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight truncate text-white">
                Próximo partido
              </h1>
              <p className="text-xs text-emerald-200/70 truncate">Hola, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <RealtimeIndicator status={realtimeStatus} hidden={!match} />
            <InstallButton
              variant="ghost"
              iconOnlyOnMobile
              className="text-emerald-100 hover:bg-emerald-500/10 hover:text-white border-emerald-400/30"
            />
            {isAdmin && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-emerald-100 hover:bg-emerald-500/10 hover:text-white"
              >
                <Link to="/admin" title="Volver al panel admin">
                  <LayoutDashboard /> <span className="hidden sm:inline">Panel</span>
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-emerald-100 hover:bg-emerald-500/10 hover:text-white"
            >
              <Link to="/perfil">
                <UserCircle2 /> <span className="hidden sm:inline">Perfil</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-emerald-100 hover:bg-emerald-500/10 hover:text-white"
            >
              <LogOut /> <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {isPending && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-emerald-300" />
          </div>
        )}

        {isError && (
          <Card className="border-destructive/40 bg-black/40 backdrop-blur">
            <CardContent className="py-6 space-y-3 text-sm">
              <p className="font-medium text-white">No pudimos cargar los partidos.</p>
              <p className="text-emerald-200/70">{(error as Error)?.message}</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {!isPending && !match && (
          <Card className="bg-black/40 backdrop-blur border-emerald-500/20">
            <CardContent className="py-12 text-center space-y-3">
              <div className="mx-auto size-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Calendar className="size-6 text-emerald-300" />
              </div>
              <div>
                <p className="font-medium text-white">No hay partidos programados</p>
                <p className="text-sm text-emerald-200/70">
                  Cuando el admin cree un partido aparecerá aquí.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {match && (
          <Card className="overflow-hidden bg-black/40 backdrop-blur border-emerald-500/20">
            <div className="h-2 bg-gradient-to-r from-lime-400 via-lime-300 to-lime-400" />
            <CardHeader>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <CardTitle className="text-xl text-white">{match.place}</CardTitle>
                <MatchStatusBadge status={match.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-emerald-200/80 pt-2">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" /> {formatMatchDate(match.dateTime)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" /> {match.place}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4" />
                  {match.registrations.length} / {match.requiredPlayers} jugadores
                </span>
              </div>
              {match.notes && (
                <p className="text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3 mt-3 text-emerald-50">
                  {match.notes}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <MatchEnrollButton match={match} />
            </CardContent>
          </Card>
        )}

        {match && (
          <MatchHeroBoard match={match} currentUserId={user?.id} canReorder={isAdmin} />
        )}
      </main>
    </div>
  )
}

function RealtimeIndicator({
  status,
  hidden,
}: {
  status: RealtimeStatus
  hidden?: boolean
}) {
  if (hidden) return null
  const config = {
    connecting: {
      Icon: Loader2,
      label: 'Conectando',
      className: 'text-muted-foreground animate-spin',
    },
    connected: { Icon: Wifi, label: '', className: 'text-primary' },
    disconnected: { Icon: WifiOff, label: 'Desconectado', className: 'text-destructive' },
  }[status]
  return (
    <span
      className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-200/70"
      title={`Realtime: ${config.label}`}
    >
      <config.Icon className={cn('size-3.5', config.className)} />
      {config.label}
    </span>
  )
}
