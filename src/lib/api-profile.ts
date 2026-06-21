import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import { authStore } from './auth-store'
import type { Profile, UpdateProfileInput } from '@/types/profile'

const QK = ['profile', 'me'] as const

export function useProfile() {
  return useQuery({
    queryKey: QK,
    queryFn: async () => {
      const { data } = await api.get<Profile>('/profile/me')
      return data
    },
  })
}

function syncAuthStoreFrom(profile: Profile) {
  const token = authStore.getToken()
  const refreshToken = authStore.getRefreshToken()
  if (!token || !refreshToken) return
  // El JWT sigue vigente, solo refrescamos los campos cacheados que muestra la UI.
  authStore.setSession(token, refreshToken, {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    roles: profile.roles,
    status: profile.status,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { data } = await api.patch<Profile>('/profile/me', input)
      return data
    },
    onSuccess: (data) => {
      qc.setQueryData(QK, data)
      // El nombre puede haber cambiado → invalidar partidos para refrescar la plantilla.
      qc.invalidateQueries({ queryKey: ['matches'] })
      syncAuthStoreFrom(data)
    },
  })
}

export function useUploadProfilePhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('photo', file)
      const { data } = await api.post<Profile>('/profile/me/photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: (data) => {
      qc.setQueryData(QK, data)
      qc.invalidateQueries({ queryKey: ['matches'] })
      syncAuthStoreFrom(data)
    },
  })
}
