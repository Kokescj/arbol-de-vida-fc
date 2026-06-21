import { LogOut, Calendar, Users, LayoutDashboard, UserCircle2, PlaySquare } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { InstallButton } from '@/components/install-button'
import { UserAvatar } from '@/components/user-avatar'
import { useCurrentUser, useLogout } from '@/hooks/use-auth'
import { useProfile } from '@/lib/api-profile'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/admin/partidos', label: 'Partidos', icon: Calendar, end: false },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users, end: false, disabled: true },
]

export function AdminShell() {
  const user = useCurrentUser()
  const { data: profile } = useProfile()
  const logout = useLogout()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout.mutateAsync()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-3 min-w-0">
            <UserAvatar
              photoUrl={profile?.photoUrl}
              name={profile?.name ?? user?.name}
              className="size-9"
              fallbackClassName="bg-primary/10 text-primary text-xs"
            />
            <div className="min-w-0">
              <h1 className="text-base font-bold leading-tight truncate">Panel administrativo</h1>
              <p className="text-xs text-muted-foreground truncate">Hola, {user?.name}</p>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <InstallButton iconOnlyOnMobile />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
            >
              <Link to="/partido-activo">
                <PlaySquare /> Vista del partido
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="sm:hidden">
              <Link to="/partido-activo" title="Vista del partido">
                <PlaySquare />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/perfil">
                <UserCircle2 /> <span className="hidden sm:inline">Mi perfil</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut /> <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>

        <nav className="mx-auto max-w-6xl px-4 flex gap-1 overflow-x-auto">
          {NAV.map(({ to, label, icon: Icon, end, disabled }) =>
            disabled ? (
              <span
                key={to}
                className="px-3 py-2.5 text-sm font-medium text-muted-foreground/60 cursor-not-allowed inline-flex items-center gap-2"
                title="Próximamente"
              >
                <Icon className="size-4" /> {label}
              </span>
            ) : (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2.5 text-sm font-medium border-b-2 -mb-px inline-flex items-center gap-2 transition-colors',
                    isActive
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )
                }
              >
                <Icon className="size-4" /> {label}
              </NavLink>
            ),
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
