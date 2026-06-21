import type { CurrentUser } from '@/types/auth'

const TOKEN_KEY = 'advfc.token'
const REFRESH_KEY = 'advfc.refreshToken'
const USER_KEY = 'advfc.user'

type Listener = () => void
const listeners = new Set<Listener>()

// Snapshot cacheado para useSyncExternalStore: getUser debe devolver la misma
// referencia mientras los datos no cambien, sino React detecta "snapshot mismatch"
// y entra en loop infinito.
let cachedUserRaw: string | null = null
let cachedUser: CurrentUser | null = null

function notify() {
  listeners.forEach((l) => l())
}

export const authStore = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY)
  },
  getUser(): CurrentUser | null {
    const raw = localStorage.getItem(USER_KEY)
    if (raw === cachedUserRaw) return cachedUser
    cachedUserRaw = raw
    if (!raw) {
      cachedUser = null
      return null
    }
    try {
      cachedUser = JSON.parse(raw) as CurrentUser
    } catch {
      cachedUser = null
    }
    return cachedUser
  },
  setSession(token: string, refreshToken: string, user: CurrentUser) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(REFRESH_KEY, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    // Invalidar cache para forzar re-parse en el próximo getUser.
    cachedUserRaw = null
    notify()
  },
  updateTokens(token: string, refreshToken: string) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(REFRESH_KEY, refreshToken)
    notify()
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
    cachedUserRaw = null
    cachedUser = null
    notify()
  },
  subscribe(l: Listener): () => void {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}
