import { Link } from 'react-router-dom'
import { Plus, MapPin, Clock, Users, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MatchStatusBadge } from '@/components/match-status-badge'
import { useMatches } from '@/lib/api-matches'
import { formatMatchDate } from '@/lib/format'

export default function AdminMatchesList() {
  const { data, isPending, isError, error, refetch } = useMatches()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">Partidos</h2>
          <p className="text-sm text-muted-foreground">
            {data?.length ?? 0} partido{data?.length === 1 ? '' : 's'} en total
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/partidos/nuevo">
            <Plus /> Nuevo
          </Link>
        </Button>
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
              <p className="font-medium">No se pudieron cargar los partidos.</p>
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
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-muted-foreground">Aún no hay partidos.</p>
            <Button asChild>
              <Link to="/admin/partidos/nuevo">
                <Plus /> Crear el primero
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {data && data.length > 0 && (
        <div className="grid gap-3">
          {data.map((m) => (
            <Link key={m.id} to={`/admin/partidos/${m.id}`} className="block group">
              <Card className="group-hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{m.place}</h3>
                      <MatchStatusBadge status={m.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-4" /> {formatMatchDate(m.dateTime)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-4" /> {m.place}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-4" />
                        {m._count.registrations} / {m.requiredPlayers}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
