import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { AdminUser, CreateUserInput, UpdateUserInput } from '@/types/admin-user'

const QK = {
  all: ['admin', 'users'] as const,
  detail: (id: string) => ['admin', 'users', id] as const,
}

export function useUsers() {
  return useQuery({
    queryKey: QK.all,
    queryFn: async () => {
      const { data } = await api.get<AdminUser[]>('/users')
      return data
    },
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const { data } = await api.post<AdminUser>('/users', input)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.all })
    },
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateUserInput }) => {
      const { data } = await api.patch<AdminUser>(`/users/${id}`, input)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.all })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.all })
    },
  })
}
