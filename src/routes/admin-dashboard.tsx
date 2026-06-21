import { Link } from 'react-router-dom'
import { Calendar, Users, ArrowRight, Plus, PlaySquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMatches } from '@/lib/api-matches'

export default function AdminDashboard() {
  const matches = useMatches()
  const openMatches = matches.data?.filter((m) => m.status === 'open').length ?? 0
  const totalMatches = matches.data?.length ?? 0

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:border-primary/60 transition-colors">
        <CardHeader className="flex flex-row items-start gap-4">
          <div className="size-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <PlaySquare className="size-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">Vista del partido</CardTitle>
            <CardDescription>
              La misma pantalla que ven los jugadores: plantilla en vivo, equipos A y B,
              botón para inscribirte.
            </CardDescription>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/partido-activo">
              Abrir <ArrowRight />
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Partidos totales</CardDescription>
            <CardTitle className="text-3xl">{totalMatches}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {openMatches} abiertos a inscripción
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Usuarios registrados</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Endpoint admin pendiente</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Calendar className="size-5 text-primary" />
            </div>
            <CardTitle>Partidos</CardTitle>
            <CardDescription>Crea, edita y cancela partidos.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild className="flex-1">
              <Link to="/admin/partidos/nuevo">
                <Plus /> Nuevo partido
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/admin/partidos">
                Ver lista <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <div className="size-10 rounded-lg bg-muted flex items-center justify-center mb-2">
              <Users className="size-5 text-muted-foreground" />
            </div>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Gestionar jugadores y asignar roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Próximamente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
