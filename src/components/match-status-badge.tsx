import type { MatchStatus } from '@/types/match'
import { cn } from '@/lib/utils'

const VARIANTS: Record<MatchStatus, { label: string; classes: string }> = {
  open: { label: 'Abierto', classes: 'bg-primary/10 text-primary border-primary/20' },
  closed: { label: 'Cupo lleno', classes: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400' },
  cancelled: { label: 'Cancelado', classes: 'bg-destructive/10 text-destructive border-destructive/20' },
  finished: { label: 'Finalizado', classes: 'bg-muted text-muted-foreground border-border' },
}

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  const v = VARIANTS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        v.classes,
      )}
    >
      {v.label}
    </span>
  )
}
