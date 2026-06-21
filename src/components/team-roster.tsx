import { UserPlus2 } from 'lucide-react'
import type { MatchRegistration } from '@/types/match'
import type { TeamKey } from '@/lib/teams'
import { resolveAssetUrl } from '@/lib/assets'
import { cn } from '@/lib/utils'

interface Props {
  team: TeamKey
  players: MatchRegistration[]
  capacity: number
  currentUserId?: string
}

const TEAM_STYLES: Record<TeamKey, {
  ring: string
  bg: string
  badgeBg: string
  badgeText: string
  accent: string
}> = {
  A: {
    ring: 'border-primary/30',
    bg: 'bg-primary/5',
    badgeBg: 'bg-primary',
    badgeText: 'text-primary-foreground',
    accent: 'text-primary',
  },
  B: {
    ring: 'border-sky-500/30',
    bg: 'bg-sky-500/5',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-white',
    accent: 'text-sky-700 dark:text-sky-400',
  },
}

export function TeamRoster({ team, players, capacity, currentUserId }: Props) {
  const styles = TEAM_STYLES[team]
  const emptySlots = Math.max(0, capacity - players.length)

  return (
    <div className={cn('rounded-xl border-2 overflow-hidden', styles.ring)}>
      <header className={cn('px-4 py-3 flex items-center gap-3', styles.bg)}>
        <span
          className={cn(
            'size-10 rounded-lg flex items-center justify-center font-black text-lg shadow-sm',
            styles.badgeBg,
            styles.badgeText,
          )}
        >
          {team}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold leading-tight">Equipo {team}</h3>
          <p className={cn('text-xs font-medium', styles.accent)}>
            {players.length} / {capacity} jugadores
          </p>
        </div>
      </header>

      <ul className="divide-y bg-card">
        {players.map((r, idx) => {
          const isMe = r.userId === currentUserId
          return (
            <li
              key={r.id}
              className={cn(
                'p-3 flex items-center gap-3 transition-colors',
                isMe && styles.bg,
              )}
            >
              <span className="w-6 text-center text-xs font-semibold text-muted-foreground tabular-nums shrink-0">
                {idx + 1}
              </span>
              {r.user.photoUrl ? (
                <img
                  src={resolveAssetUrl(r.user.photoUrl)}
                  alt={r.user.name}
                  className="size-11 rounded-full object-cover shrink-0"
                />
              ) : (
                <div
                  className={cn(
                    'size-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                    isMe ? cn(styles.badgeBg, styles.badgeText) : 'bg-muted text-muted-foreground',
                  )}
                >
                  {r.user.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate leading-tight">
                  {r.user.jerseyName || `${r.user.name} ${r.user.lastName ?? ''}`.trim()}
                  {isMe && (
                    <span className={cn('ml-2 text-xs font-medium', styles.accent)}>(tú)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {r.user.name} {r.user.lastName ?? ''}
                </p>
              </div>
              {r.user.preferredNumber != null && (
                <span
                  className={cn(
                    'size-10 rounded-md font-black flex items-center justify-center text-base shrink-0',
                    styles.bg,
                    styles.accent,
                  )}
                >
                  {r.user.preferredNumber}
                </span>
              )}
            </li>
          )
        })}

        {Array.from({ length: emptySlots }).map((_, idx) => (
          <li
            key={`empty-${idx}`}
            className="p-3 flex items-center gap-3 text-muted-foreground/60"
          >
            <span className="w-6 text-center text-xs font-semibold tabular-nums shrink-0">
              {players.length + idx + 1}
            </span>
            <div className="size-11 rounded-full border-2 border-dashed flex items-center justify-center shrink-0">
              <UserPlus2 className="size-4" />
            </div>
            <p className="flex-1 text-sm italic">Lugar disponible</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
