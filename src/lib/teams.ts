import type { MatchRegistration } from '@/types/match'

export type TeamKey = 'A' | 'B'

export interface TeamSlot {
  team: TeamKey
  // Posición absoluta del slot en la plantilla (1..requiredPlayers).
  position: number
  // Posición dentro del equipo (1..slotsPerTeam) — para mostrar "01", "02"...
  positionInTeam: number
  registration?: MatchRegistration
}

export interface TeamLayout {
  teamA: TeamSlot[]
  teamB: TeamSlot[]
  slotsPerTeam: number
}

// Construye el layout de la plantilla:
// - Slots 1..slotsA → Equipo A
// - Slots slotsA+1..requiredPlayers → Equipo B
// - Cada registration con `position` ocupa esa posición exacta.
// - Las registrations sin `position` se asignan al primer slot libre por orden de inscripción.
export function buildTeams(
  registrations: MatchRegistration[],
  requiredPlayers: number,
): TeamLayout {
  const slotsPerTeam = Math.ceil(requiredPlayers / 2)

  const positioned = registrations.filter(
    (r): r is MatchRegistration & { position: number } =>
      r.position != null && r.position >= 1 && r.position <= requiredPlayers,
  )
  const unpositioned = registrations
    .filter((r) => r.position == null)
    .sort(
      (a, b) =>
        new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime(),
    )

  const occupiedPositions = new Set(positioned.map((r) => r.position))
  const byPosition = new Map<number, MatchRegistration>()
  for (const r of positioned) {
    byPosition.set(r.position, r)
  }

  // Asignar slot libre a las no posicionadas en orden de inscripción.
  let nextSlot = 1
  for (const r of unpositioned) {
    while (occupiedPositions.has(nextSlot) && nextSlot <= requiredPlayers) {
      nextSlot++
    }
    if (nextSlot > requiredPlayers) break
    byPosition.set(nextSlot, r)
    occupiedPositions.add(nextSlot)
    nextSlot++
  }

  const teamA: TeamSlot[] = []
  const teamB: TeamSlot[] = []
  for (let i = 1; i <= requiredPlayers; i++) {
    const team: TeamKey = i <= slotsPerTeam ? 'A' : 'B'
    const positionInTeam = team === 'A' ? i : i - slotsPerTeam
    const slot: TeamSlot = {
      team,
      position: i,
      positionInTeam,
      registration: byPosition.get(i),
    }
    if (team === 'A') teamA.push(slot)
    else teamB.push(slot)
  }
  return { teamA, teamB, slotsPerTeam }
}
