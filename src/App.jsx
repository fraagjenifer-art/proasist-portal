import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ConsumersPage from './pages/ConsumersPage'
import ConsumerDetailPage from './pages/ConsumerDetailPage'
import NewConsumerPage from './pages/NewConsumerPage'
import BrandingPage from './pages/BrandingPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/consumidores" element={<ConsumersPage />} />
            <Route path="/consumidores/nuevo" element={<NewConsumerPage />} />
            <Route path="/consumidores/:id" element={<ConsumerDetailPage />} />
            <Route path="/branding" element={
              <ProtectedRoute allowedRoles={['repairer', 'super_admin']}>
                <BrandingPage />
              </ProtectedRoute>
            } />
            <Route path="/documentos" element={<div className="p-6"><h1 className="font-display text-2xl font-bold text-[#1F3A5F]">Documentos</h1><p className="text-slate-400 mt-2 text-sm">Próximamente.</p></div>} />
            <Route path="/reportes" element={<div className="p-6"><h1 className="font-display text-2xl font-bold text-[#1F3A5F]">Reportes</h1><p className="text-slate-400 mt-2 text-sm">Próximamente.</p></div>} />
            <Route path="/organizaciones" element={<div className="p-6"><h1 className="font-display text-2xl font-bold text-[#1F3A5F]">Organizaciones CRO</h1><p className="text-slate-400 mt-2 text-sm">Próximamente.</p></div>} />
            <Route path="/usuarios" element={<div className="p-6"><h1 className="font-display text-2xl font-bold text-[#1F3A5F]">Usuarios y VAs</h1><p className="text-slate-400 mt-2 text-sm">Próximamente.</p></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
