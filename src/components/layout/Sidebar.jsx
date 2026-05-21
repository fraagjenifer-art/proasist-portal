import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, FileText, BarChart2,
  Palette, LogOut, Shield, Settings, UserCog
} from 'lucide-react'
import clsx from 'clsx'

const navByRole = {
  super_admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/organizaciones', icon: Shield, label: 'Organizaciones CRO' },
    { to: '/usuarios', icon: UserCog, label: 'Usuarios y VAs' },
    { to: '/consumidores', icon: Users, label: 'Consumidores' },
    { to: '/reportes', icon: BarChart2, label: 'Reportes' },
    { to: '/configuracion', icon: Settings, label: 'Configuración' },
  ],
  va: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/consumidores', icon: Users, label: 'Mis consumidores' },
    { to: '/documentos', icon: FileText, label: 'Documentos' },
    { to: '/reportes', icon: BarChart2, label: 'Reportes' },
  ],
  repairer: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/consumidores', icon: Users, label: 'Consumidores' },
    { to: '/documentos', icon: FileText, label: 'Documentos' },
    { to: '/reportes', icon: BarChart2, label: 'Reportes' },
    { to: '/branding', icon: Palette, label: 'Kit de Marca' },
  ],
  consumer: [
    { to: '/mi-score', icon: BarChart2, label: 'Mi Score' },
    { to: '/mi-avance', icon: FileText, label: 'Mi Avance' },
    { to: '/mis-documentos', icon: FileText, label: 'Mis Documentos' },
  ],
}

const roleLabels = {
  super_admin: 'Super Admin',
  va: 'Asistente Virtual',
  repairer: 'Reparador',
  consumer: 'Consumidor',
}

const isProasistRole = (role) => ['super_admin', 'va'].includes(role)

export default function Sidebar() {
  const { profile, organization, signOut } = useAuth()
  const navigate = useNavigate()
  const role = profile?.role || 'consumer'
  const navItems = navByRole[role] || []
  const proasist = isProasistRole(role)

  const primaryColor = proasist ? '#1F3A5F' : (organization?.color_primary || '#1F3A5F')
  const tealColor = proasist ? '#2FA4A9' : (organization?.color_secondary || '#2FA4A9')

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <aside
      className="w-64 min-h-screen flex flex-col"
      style={{ background: primaryColor }}
    >
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        {proasist ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: tealColor }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-display font-semibold text-sm leading-tight">ProAssist</p>
              <p className="text-white/50 text-xs">Agency Portal</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {organization?.logo_url ? (
              <img src={organization.logo_url} alt="Logo" className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: tealColor }}>
                {organization?.name?.charAt(0) || 'C'}
              </div>
            )}
            <div>
              <p className="text-white font-semibold text-sm leading-tight truncate max-w-[140px]">
                {organization?.name || 'Mi Portal'}
              </p>
              <p className="text-white/50 text-xs">Portal CRO</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            )}
            style={({ isActive }) => isActive ? { background: tealColor } : {}}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: tealColor }}>
            {profile?.full_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{profile?.full_name || 'Usuario'}</p>
            <p className="text-white/40 text-xs">{roleLabels[role]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/50 hover:text-white text-xs w-full px-2 py-1.5 rounded-lg hover:bg-white/10 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
