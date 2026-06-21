import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from 'socket.io-client'
import { authStore } from '@/lib/auth-store'

// Deriva la URL del WebSocket eliminando el path /api del baseURL HTTP.
// Si VITE_API_URL no está, usa el origen actual (Netlify u otro mismo-host).
function getRealtimeUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) return window.location.origin
  return apiUrl.replace(/\/api\/?$/, '')
}

export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected'

interface PlayerRegisteredEvent {
  matchId: string
}

interface PlayerUnregisteredEvent {
  matchId: string
  userId: string
}

// Conecta al namespace /realtime, se une al room del matchId,
// e invalida la query del match cuando llegan eventos de inscripción.
export function useMatchRealtime(matchId: string | undefined): RealtimeStatus {
  const qc = useQueryClient()
  const [status, setStatus] = useState<RealtimeStatus>('connecting')

  useEffect(() => {
    if (!matchId) return

    const token = authStore.getToken()
    if (!token) {
      setStatus('disconnected')
      return
    }

    const socket: Socket = io(`${getRealtimeUrl()}/realtime`, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket', 'polling'],
    })

    function handleConnect() {
      setStatus('connected')
      socket.emit('match:join', matchId)
    }
    function handleDisconnect() {
      setStatus('disconnected')
    }
    function handleRegistered(evt: PlayerRegisteredEvent) {
      if (evt.matchId !== matchId) return
      qc.invalidateQueries({ queryKey: ['matches', matchId] })
      qc.invalidateQueries({ queryKey: ['matches'] })
      qc.invalidateQueries({ queryKey: ['matches', 'active'] })
    }
    function handleUnregistered(evt: PlayerUnregisteredEvent) {
      if (evt.matchId !== matchId) return
      qc.invalidateQueries({ queryKey: ['matches', matchId] })
      qc.invalidateQueries({ queryKey: ['matches'] })
      qc.invalidateQueries({ queryKey: ['matches', 'active'] })
    }
    function handleReordered(evt: { matchId: string }) {
      if (evt.matchId !== matchId) return
      qc.invalidateQueries({ queryKey: ['matches', matchId] })
      qc.invalidateQueries({ queryKey: ['matches', 'active'] })
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('player.registered', handleRegistered)
    socket.on('player.unregistered', handleUnregistered)
    socket.on('players.reordered', handleReordered)

    return () => {
      socket.emit('match:leave', matchId)
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('player.registered', handleRegistered)
      socket.off('player.unregistered', handleUnregistered)
      socket.off('players.reordered', handleReordered)
      socket.disconnect()
    }
  }, [matchId, qc])

  return status
}
