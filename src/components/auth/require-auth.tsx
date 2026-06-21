import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/use-auth'
import type { UserRole } from '@/types/auth'

interface Props {
  roles?: UserRole[]
}

export function RequireAuth({ roles }: Props) {
  const user = useCurrentUser()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && roles.length > 0 && !roles.some((r) => user.roles.includes(r))) {
    return <Navigate to="/partido-activo" replace />
  }

  return <Outlet />
}
