import { CheckCircle2, Loader2, UserMinus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/use-auth'
import { useRegisterToMatch, useUnregisterFromMatch } from '@/lib/api-matches'
import type { MatchDetail } from '@/types/match'

interface Props {
  match: MatchDetail
}

export function MatchEnrollButton({ match }: Props) {
  const user = useCurrentUser()
  const register = useRegisterToMatch(match.id)
  const unregister = useUnregisterFromMatch(match.id)

  if (!user) return null

  const myReg = match.registrations.find((r) => r.userId === user.id)
  const isFull = match.registrations.length >= match.requiredPlayers
  const isOpen = match.status === 'open'

  const mutationError =
    (register.error as { response?: { data?: { message?: string | string[] } } } | null)?.response?.data
      ?.message ??
    (unregister.error as { response?: { data?: { message?: string | string[] } } } | null)?.response?.data
      ?.message ??
    null

  if (myReg) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <CheckCircle2 className="size-5" /> Estás inscrito en este partido
        </div>
        <Button
          variant="outline"
          className="w-full"
          disabled={unregister.isPending}
          onClick={() => unregister.mutate()}
        >
          {unregister.isPending ? <Loader2 className="animate-spin" /> : <UserMinus />}
          Retirarme
        </Button>
        {mutationError && (
          <p className="text-sm text-destructive">
            {Array.isArray(mutationError) ? mutationError.join(', ') : mutationError}
          </p>
        )}
      </div>
    )
  }

  if (!isOpen) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground text-center">
        El partido no está aceptando inscripciones.
      </div>
    )
  }

  if (isFull) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground text-center">
        Cupo lleno. No puedes inscribirte.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        className="w-full"
        disabled={register.isPending}
        onClick={() => register.mutate()}
      >
        {register.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
        Inscribirme al partido
      </Button>
      {mutationError && (
        <p className="text-sm text-destructive text-center">
          {Array.isArray(mutationError) ? mutationError.join(', ') : mutationError}
        </p>
      )}
    </div>
  )
}
