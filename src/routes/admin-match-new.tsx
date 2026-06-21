import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MatchForm } from '@/components/match-form'
import { useCreateMatch } from '@/lib/api-matches'

export default function AdminMatchNew() {
  const navigate = useNavigate()
  const create = useCreateMatch()

  const errorMessage = (() => {
    const err = create.error as { response?: { data?: { message?: string | string[] } } } | null
    return err?.response?.data?.message ?? null
  })()

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-3">
        <Link to="/admin/partidos">
          <ArrowLeft /> Volver
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo partido</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchForm
            submitLabel="Crear partido"
            submitting={create.isPending}
            errorMessage={errorMessage}
            onSubmit={async (input) => {
              const created = await create.mutateAsync(input)
              navigate(`/admin/partidos/${created.id}`, { replace: true })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
