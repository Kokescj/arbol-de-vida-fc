import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/use-auth'

// Decide la página por defecto según el rol del usuario logueado.
// Si no hay sesión, manda al login.
export function RedirectByRole() {
  const user = useCurrentUser()

  if (!user) return <Navigate to="/login" replace />

  const isAdmin = user.roles.includes('admin') || user.roles.includes('supervisor')
  return <Navigate to={isAdmin ? '/admin' : '/partido-activo'} replace />
}
