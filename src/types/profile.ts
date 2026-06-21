import type { UserRole } from './auth'

export interface Profile {
  id: string
  name: string
  lastName?: string | null
  jerseyName?: string | null
  preferredNumber?: number | null
  photoUrl?: string | null
  email: string
  roles: UserRole[]
  status: string
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileInput {
  name?: string
  lastName?: string
  jerseyName?: string
  preferredNumber?: number
  photoUrl?: string
}
