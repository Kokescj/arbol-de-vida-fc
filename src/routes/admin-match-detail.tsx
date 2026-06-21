import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Trash2, AlertCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { MatchEnrollButton } from '@/components/match-enroll-button'
import { MatchForm } from '@/components/match-form'
import { MatchStatusBadge } from '@/components/match-status-badge'
import { TeamRoster } from '@/components/team-roster'
import { useCurrentUser } from '@/hooks/use-auth'
import { useMatchRealtime } from '@/hooks/use-match-realtime'
import { useDeleteMatch, useMatch, useUpdateMatch } from '@/lib/api-matches'
import { formatMatchDate, toDateTimeLocal } from '@/lib/format'
import { buildTeams } from '@/lib/teams'
import type { MatchStatus } from '@/types/match'

const STATUSES: { value: MatchStatus; label: string }[] = [
  { value: 'open', label: 'Abierto a inscripciones' },
  { value: 'closed', label: 'Cerrado (cupo lleno)' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'finished', label: 'Finalizado' },
]

export default function AdminMatchDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isPending, isError, error } = useMatch(id)
  const update = useUpdateMatch(id ?? '')
  const remove = useDeleteMatch()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const currentUser = useCurrentUser()
  useMatchRealtime(id)

  if (!id) return <Navigate to="/admin/partidos" replace />

  const updateError = (() => {
    const err = update.error as { response?: { data?: { message?: string | string[] } } } | null
    return err?.response?.data?.message ?? null
  })()

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-3">
        <Link to="/admin/partidos">
          <ArrowLeft /> Volver a la lista
        </Link>
      </Button>

      {isPending && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <Card className="border-destructive/40">
          <CardContent className="py-6 flex items-center gap-3 text-sm">
            <AlertCircle className="size-5 text-destructive shrink-0" />
            <p>{(error as Error)?.message ?? 'Error al cargar el partido'}</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl font-bold">{data.place}</h2>
              <p className="text-sm text-muted-foreground">
                {formatMatchDate(data.dateTime)} · creado por {data.createdBy.name}
              </p>
            </div>
            <MatchStatusBadge status={data.status} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Editar partido</CardTitle>
              <CardDescription>
                Los cambios se aplican inmediatamente. La fecha está en tu zona horaria.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={data.status}
                  onChange={(e) => update.mutate({ status: e.target.value as MatchStatus })}
                  disabled={update.isPending}
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <MatchForm
                submitLabel="Guardar cambios"
                submitting={update.isPending}
                errorMessage={updateError}
                initial={{
                  place: data.place,
                  dateTimeLocal: toDateTimeLocal(data.dateTime),
                  requiredPlayers: data.requiredPlayers,
                  notes: data.notes ?? '',
                }}
                onSubmit={(input) => update.mutate(input)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg inline-flex items-center gap-2">
                <Users className="size-5" />
                Plantilla ({data.registrations.length} / {data.requiredPlayers})
              </CardTitle>
              <CardDescription>Jugadores inscritos en este partido.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MatchEnrollButton match={data} />
              {(() => {
                const { teamA, teamB, slotsPerTeam } = buildTeams(
                  data.registrations,
                  data.requiredPlayers,
                )
                const playersA = teamA.map((s) => s.registration).filter(Boolean) as typeof data.registrations
                const playersB = teamB.map((s) => s.registration).filter(Boolean) as typeof data.registrations
                const slotsB = data.requiredPlayers - slotsPerTeam
                return (
                  <div className="grid gap-3 md:grid-cols-2">
                    <TeamRoster
                      team="A"
                      players={playersA}
                      capacity={slotsPerTeam}
                      currentUserId={currentUser?.id}
                    />
                    <TeamRoster
                      team="B"
                      players={playersB}
                      capacity={slotsB}
                      currentUserId={currentUser?.id}
                    />
                  </div>
                )
              })()}
            </CardContent>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Zona peligrosa</CardTitle>
              <CardDescription>Eliminar el partido borra también las inscripciones.</CardDescription>
            </CardHeader>
            <CardContent>
              {!confirmingDelete ? (
                <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
                  <Trash2 /> Eliminar partido
                </Button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium flex-1">¿Confirmas? No se puede deshacer.</p>
                  <Button variant="outline" onClick={() => setConfirmingDelete(false)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={remove.isPending}
                    onClick={async () => {
                      await remove.mutateAsync(id)
                      navigate('/admin/partidos', { replace: true })
                    }}
                  >
                    {remove.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
                    Sí, eliminar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
