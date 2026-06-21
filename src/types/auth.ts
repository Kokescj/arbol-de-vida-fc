export type UserRole = 'admin' | 'supervisor' | 'usuario'

export interface CurrentUser {
  id: string
  name: string
  email: string
  roles: UserRole[]
  status?: string
}

export interface LoginResponse {
  message: string
  user: CurrentUser
  token: string
  refreshToken: string
}

export interface RefreshResponse {
  message: string
  user: CurrentUser
  token: string
  refreshToken: string
}
