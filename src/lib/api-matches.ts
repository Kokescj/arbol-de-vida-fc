import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type {
  CreateMatchInput,
  MatchDetail,
  MatchListItem,
  UpdateMatchInput,
} from '@/types/match'

const QK = {
  all: ['matches'] as const,
  detail: (id: string) => ['matches', id] as const,
}

export function useMatches() {
  return useQuery({
    queryKey: QK.all,
    queryFn: async () => {
      const { data } = await api.get<MatchListItem[]>('/matches')
      return data
    },
  })
}

// El próximo partido relevante para el usuario: el match con dateTime futuro
// más cercano que no esté cancelado ni finalizado. Si ninguno cumple, devuelve null.
export function useActiveMatch() {
  return useQuery({
    queryKey: ['matches', 'active'],
    queryFn: async () => {
      const { data } = await api.get<MatchListItem[]>('/matches')
      const now = Date.now()
      const upcoming = data
        .filter((m) => m.status !== 'cancelled' && m.status !== 'finished')
        .filter((m) => new Date(m.dateTime).getTime() >= now)
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      const next = upcoming[0]
      if (!next) return null
      // Re-fetch del detalle para tener la plantilla completa.
      const { data: detail } = await api.get<MatchDetail>(`/matches/${next.id}`)
      return detail
    },
  })
}

export function useMatch(id: string | undefined) {
  return useQuery({
    queryKey: id ? QK.detail(id) : ['matches', 'disabled'],
    queryFn: async () => {
      const { data } = await api.get<MatchDetail>(`/matches/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateMatchInput) => {
      const { data } = await api.post<MatchDetail>('/matches', input)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.all })
    },
  })
}

export function useUpdateMatch(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateMatchInput) => {
      const { data } = await api.patch<MatchDetail>(`/matches/${id}`, input)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.all })
      qc.invalidateQueries({ queryKey: QK.detail(id) })
    },
  })
}

export function useDeleteMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/matches/${id}`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.all })
    },
  })
}

export function useRegisterToMatch(matchId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/matches/${matchId}/register`)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.detail(matchId) })
      qc.invalidateQueries({ queryKey: QK.all })
    },
  })
}

export function useUnregisterFromMatch(matchId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/matches/${matchId}/register`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.detail(matchId) })
      qc.invalidateQueries({ queryKey: QK.all })
    },
  })
}

export interface RegistrationAssignment {
  registrationId: string
  position: number
}

export function useReorderRegistrations(matchId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (assignments: RegistrationAssignment[]) => {
      await api.patch(`/matches/${matchId}/registrations/reorder`, { assignments })
      return assignments
    },
    onMutate: async (assignments) => {
      await qc.cancelQueries({ queryKey: QK.detail(matchId) })
      await qc.cancelQueries({ queryKey: ['matches', 'active'] })
      const prevDetail = qc.getQueryData<MatchDetail>(QK.detail(matchId))
      const prevActive = qc.getQueryData<MatchDetail | null>(['matches', 'active'])
      const apply = (m: MatchDetail | null | undefined) => {
        if (!m) return m
        const byRegId = new Map(assignments.map((a) => [a.registrationId, a.position]))
        const next = m.registrations.map((r) => {
          const newPos = byRegId.get(r.id)
          return newPos != null ? { ...r, position: newPos } : r
        })
        return { ...m, registrations: next }
      }
      if (prevDetail) qc.setQueryData(QK.detail(matchId), apply(prevDetail))
      if (prevActive) qc.setQueryData(['matches', 'active'], apply(prevActive))
      return { prevDetail, prevActive }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevDetail) qc.setQueryData(QK.detail(matchId), ctx.prevDetail)
      if (ctx?.prevActive) qc.setQueryData(['matches', 'active'], ctx.prevActive)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.detail(matchId) })
      qc.invalidateQueries({ queryKey: ['matches', 'active'] })
    },
  })
}
