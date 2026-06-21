// Convierte una URL de asset relativa del backend (ej: "/uploads/players/xxx.jpg")
// a absoluta usando el origen del API. Las URLs ya absolutas (http/https/data:) pasan tal cual.
export function resolveAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (/^(https?:|data:|blob:)/.test(path)) return path
  const apiUrl = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api')
  const origin = apiUrl.replace(/\/api\/?$/, '')
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}
