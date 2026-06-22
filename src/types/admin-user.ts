import type { UserRole } from './auth'

export interface AdminUser {
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

export interface UpdateUserInput {
  name?: string
  lastName?: string
  roles?: UserRole[]
  status?: 'activo' | 'suspendido'
  password?: string
}

export interface CreateUserInput {
  name: string
  lastName?: string
  email: string
  password: string
  roles?: UserRole[]
}
