import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { api } from '@/lib/api'
import { authStore } from '@/lib/auth-store'
import type { CurrentUser, LoginResponse } from '@/types/auth'

interface LoginInput {
  email: string
  password: string
}

export function useCurrentUser(): CurrentUser | null {
  return useSyncExternalStore(
    authStore.subscribe,
    authStore.getUser,
    () => null,
  )
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post<LoginResponse>('/auth/login', input)
      return data
    },
    onSuccess: (data) => {
      authStore.setSession(data.token, data.refreshToken, data.user)
      qc.invalidateQueries()
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const refreshToken = authStore.getRefreshToken()
      if (refreshToken) {
        try {
          await api.post('/auth/revoke', { refreshToken })
        } catch {
          // Si falla la revocación remota, igual cerramos sesión local.
        }
      }
    },
    onSettled: () => {
      authStore.clear()
      qc.clear()
    },
  })
}
