export type MatchStatus = 'open' | 'closed' | 'cancelled' | 'finished'

export interface MatchPlayer {
  id: string
  name: string
  lastName?: string | null
  jerseyName?: string | null
  preferredNumber?: number | null
  photoUrl?: string | null
}

export interface MatchRegistration {
  id: string
  matchId: string
  userId: string
  registeredAt: string
  position?: number | null
  user: MatchPlayer
}

export interface Match {
  id: string
  place: string
  dateTime: string
  requiredPlayers: number
  notes?: string | null
  status: MatchStatus
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface MatchListItem extends Match {
  _count: { registrations: number }
}

export interface MatchDetail extends Match {
  registrations: MatchRegistration[]
  createdBy: { id: string; name: string }
}

export interface CreateMatchInput {
  place: string
  dateTime: string
  requiredPlayers: number
  notes?: string
}

export interface UpdateMatchInput extends Partial<CreateMatchInput> {
  status?: MatchStatus
}
