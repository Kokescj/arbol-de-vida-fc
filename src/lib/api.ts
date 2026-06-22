import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { authStore } from './auth-store'
import type { RefreshResponse } from '@/types/auth'

// En dev: fallback al backend local. En prod: '/api' del propio host —
// evita pegarse a localhost del usuario si olvidaron setear VITE_API_URL.
const baseURL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api')

export const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = authStore.getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// Cola para evitar carreras: si llegan 401 simultáneos, solo el primero refresca;
// el resto espera al mismo refresh y reintenta con el nuevo token.
let refreshing: Promise<string> | null = null

async function performRefresh(): Promise<string> {
  const refreshToken = authStore.getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const { data } = await axios.post<RefreshResponse>(`${baseURL}/auth/refresh`, { refreshToken })
  authStore.setSession(data.token, data.refreshToken, data.user)
  return data.token
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    if (status !== 401 || !original || original._retry || original.url?.includes('/auth/')) {
      return Promise.reject(error)
    }

    original._retry = true

    try {
      refreshing = refreshing ?? performRefresh()
      const newToken = await refreshing
      original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` }
      return api.request(original)
    } catch (refreshError) {
      authStore.clear()
      // Pasamos el motivo al login para que muestre un mensaje claro
      // ("sesión revocada" vs. "sesión expirada"). El backend manda el texto
      // exacto en response.data.message; lo enviamos como query param.
      const err = refreshError as AxiosError<{ message?: string | string[] }>
      const backendMsg = err?.response?.data?.message
      const reason = Array.isArray(backendMsg) ? backendMsg.join(' ') : backendMsg
      const qs = reason ? `?reason=${encodeURIComponent(reason)}` : ''
      window.location.assign(`/login${qs}`)
      return Promise.reject(refreshError)
    } finally {
      refreshing = null
    }
  },
)
