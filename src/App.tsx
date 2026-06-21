import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/components/auth/require-auth'
import { RedirectByRole } from '@/components/auth/redirect-by-role'
import { AdminShell } from '@/components/admin/admin-shell'
import LoginPage from '@/routes/login'
import AdminDashboard from '@/routes/admin-dashboard'
import AdminMatchesList from '@/routes/admin-matches-list'
import AdminMatchNew from '@/routes/admin-match-new'
import AdminMatchDetail from '@/routes/admin-match-detail'
import AdminUsersList from '@/routes/admin-users-list'
import PartidoActivo from '@/routes/partido-activo'
import PerfilPage from '@/routes/perfil'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectByRole />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth roles={['admin', 'supervisor']} />}>
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<AdminDashboard />} />
            <Route path="partidos" element={<AdminMatchesList />} />
            <Route path="partidos/nuevo" element={<AdminMatchNew />} />
            <Route path="partidos/:id" element={<AdminMatchDetail />} />
            <Route path="usuarios" element={<AdminUsersList />} />
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="/partido-activo" element={<PartidoActivo />} />
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>

        <Route path="*" element={<RedirectByRole />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
