import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
  PlayerCardHero,
  type PlayerCardDragData,
  type PlayerSlotDropData,
} from '@/components/player-card-hero'
import { buildTeams, type TeamKey, type TeamSlot } from '@/lib/teams'
import { useReorderRegistrations, type RegistrationAssignment } from '@/lib/api-matches'
import type { MatchDetail } from '@/types/match'
import { cn } from '@/lib/utils'

interface Props {
  match: MatchDetail
  currentUserId?: string
  canReorder?: boolean
}

export function MatchHeroBoard({ match, currentUserId, canReorder }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const vsRef = useRef<HTMLSpanElement>(null)
  const vsMobileRef = useRef<HTMLSpanElement>(null)
  const reorder = useReorderRegistrations(match.id)

  const layout = useMemo(
    () => buildTeams(match.registrations, match.requiredPlayers),
    [match.registrations, match.requiredPlayers],
  )

  // Detección de nuevas llegadas (igual que antes).
  const seenIds = useRef<Set<string>>(new Set())
  const initialMount = useRef(true)
  const newIds = useMemo(() => {
    const currentIds = new Set(match.registrations.map((r) => r.id))
    if (initialMount.current) {
      initialMount.current = false
      seenIds.current = currentIds
      return new Set<string>()
    }
    const fresh = new Set<string>()
    for (const id of currentIds) {
      if (!seenIds.current.has(id)) fresh.add(id)
    }
    seenIds.current = currentIds
    return fresh
  }, [match.registrations])

  // Stagger inicial
  useEffect(() => {
    if (!containerRef.current) return
    const cards = containerRef.current.querySelectorAll('[data-player-card]')
    if (cards.length === 0) return
    const tween = gsap.fromTo(
      cards,
      { opacity: 0, scale: 0.75, y: 28, rotationX: -20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        rotationX: 0,
        stagger: { each: 0.04, from: 'start' },
        duration: 0.65,
        ease: 'back.out(1.4)',
      },
    )
    return () => {
      tween.kill()
    }
  }, [match.id])

  // VS pulsante
  useGSAP(
    () => {
      const tween = (el: Element | null) => {
        if (!el) return null
        return gsap.to(el, {
          scale: 1.12,
          rotation: '+=4',
          duration: 1.2,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          transformOrigin: 'center center',
        })
      }
      const t1 = tween(vsRef.current)
      const t2 = tween(vsMobileRef.current)
      return () => {
        t1?.kill()
        t2?.kill()
      }
    },
    { scope: containerRef },
  )

  // Monitor DnD: drop a slot (vacío u ocupado). Swap si ocupado, move si vacío.
  const layoutRef = useRef(layout)
  useEffect(() => {
    layoutRef.current = layout
  })
  const reorderRef = useRef(reorder)
  useEffect(() => {
    reorderRef.current = reorder
  })

  useEffect(() => {
    if (!canReorder) return
    return monitorForElements({
      onDrop: ({ source, location }) => {
        const target = location.current.dropTargets[0]
        if (!target) return
        const sourceData = source.data as unknown as PlayerCardDragData
        const targetData = target.data as unknown as PlayerSlotDropData
        if (sourceData.type !== 'player-card' || targetData.type !== 'player-slot') return
        if (sourceData.fromPosition === targetData.position) return

        const { teamA, teamB } = layoutRef.current
        const allSlots = [...teamA, ...teamB]
        const targetSlot = allSlots.find((s) => s.position === targetData.position)
        if (!targetSlot) return

        const assignments: RegistrationAssignment[] = [
          { registrationId: sourceData.registrationId, position: targetData.position },
        ]
        // Si el target estaba ocupado, swap (el ocupante va a la posición del source).
        if (targetSlot.registration) {
          assignments.push({
            registrationId: targetSlot.registration.id,
            position: sourceData.fromPosition,
          })
        }

        console.log('[DnD] reorder', assignments)
        reorderRef.current.mutate(assignments)
      },
    })
  }, [canReorder])

  return (
    <section
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden border border-emerald-500/15 bg-black/20 backdrop-blur-sm px-4 py-8 md:px-8 md:py-12"
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]" aria-hidden>
        <div className="absolute inset-y-0 left-1/2 w-px bg-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-24 rounded-full border border-white" />
      </div>

      <header className="relative text-center mb-6 md:mb-10">
        <p className="font-display text-xs tracking-[0.4em] text-emerald-300/70 mb-1">
          ELIGE TU LADO
        </p>
        <h2 className="font-graffiti text-3xl md:text-5xl text-lime-300 drop-shadow-[0_2px_8px_rgba(132,204,22,0.4)]">
          La plantilla
        </h2>
        {canReorder && (
          <p className="text-xs text-emerald-300/70 mt-2">
            Arrastra una tarjeta a cualquier slot (vacío u ocupado) para reordenar.
          </p>
        )}
      </header>

      <div className="relative grid grid-cols-2 gap-3 md:gap-6 items-start">
        <TeamColumn
          team="A"
          slots={layout.teamA}
          slotsPerTeam={layout.slotsPerTeam}
          currentUserId={currentUserId}
          newIds={newIds}
          enableDnd={canReorder}
        />

        <div
          className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
          aria-hidden
        >
          <span
            ref={vsRef}
            className="font-graffiti text-6xl text-red-500 drop-shadow-[0_0_18px_rgba(239,68,68,0.6)] inline-block"
            style={{ transform: 'rotate(-6deg)' }}
          >
            VS
          </span>
        </div>

        <TeamColumn
          team="B"
          slots={layout.teamB}
          slotsPerTeam={match.requiredPlayers - layout.slotsPerTeam}
          currentUserId={currentUserId}
          newIds={newIds}
          enableDnd={canReorder}
        />
      </div>

      <div className="md:hidden flex justify-center my-4">
        <span
          ref={vsMobileRef}
          className="font-graffiti text-4xl text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)] inline-block"
          style={{ transform: 'rotate(-4deg)' }}
        >
          VS
        </span>
      </div>
    </section>
  )
}

function TeamColumn({
  team,
  slots,
  slotsPerTeam,
  currentUserId,
  newIds,
  enableDnd,
}: {
  team: TeamKey
  slots: TeamSlot[]
  slotsPerTeam: number
  currentUserId?: string
  newIds: Set<string>
  enableDnd?: boolean
}) {
  const accent = team === 'A' ? 'text-lime-300' : 'text-sky-300'
  const occupied = slots.filter((s) => s.registration).length

  return (
    <div className="space-y-3 md:space-y-4">
      <header className="text-center mb-1">
        <p className={cn('font-display text-xs tracking-[0.3em] opacity-70', accent)}>EQUIPO</p>
        <p
          className={cn(
            'font-graffiti text-4xl md:text-5xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]',
            accent,
          )}
        >
          {team}
        </p>
        <p className={cn('text-xs font-medium', accent, 'opacity-80')}>
          {occupied} / {slotsPerTeam} jugadores
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {slots.map((slot) => (
          <PlayerCardHero
            key={slot.position}
            slot={slot}
            isCurrentUser={slot.registration?.userId === currentUserId}
            isNewArrival={slot.registration ? newIds.has(slot.registration.id) : false}
            enableDnd={enableDnd}
          />
        ))}
      </div>
    </div>
  )
}
