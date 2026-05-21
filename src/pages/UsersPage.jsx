import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, UserCog, Search, X, Save, Mail } from 'lucide-react'

const roleLabels = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-50 text-purple-700' },
  va: { label: 'Asistente Virtual', color: 'bg-teal-50 text-teal-700' },
  repairer: { label: 'Reparador CRO', color: 'bg-blue-50 text-blue-700' },
  consumer: { label: 'Consumidor', color: 'bg-slate-100 text-slate-600' },
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [orgs, setOrgs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'va', org_id: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: u }, { data: o }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('organizations').select('id, name').eq('is_active', true),
    ])
    setUsers(u || [])
    setOrgs(o || [])
    setLoading(false)
  }

  async function handleCreate() {
    if (!form.full_name || !form.email || !form.password) {
      setError('Nombre, email y contraseña son obligatorios.')
      return
    }
    setSaving(true)
    setError('')

    // Create auth user
    const { data, error: authError } = await supabase.auth.admin
      ? supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.full_name, role: form.role } } })
      : { data: null, error: { message: 'No admin access' } }

    // Fallback: insert directly using signUp
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: form.role } }
    })

    if (signUpError) {
      setError('Error: ' + signUpError.message)
      setSaving(false)
      return
    }

    // Update profile with role and org
    if (signUpData?.user) {
      await supabase.from('profiles').upsert({
        id: signUpData.user.id,
        full_name: form.full_name,
        email: form.email,
        role: form.role,
        org_id: form.org_id || null,
      })
    }

    setSaving(false)
    setShowModal(false)
    setSuccess(`Usuario ${form.email} creado. Debe verificar su correo antes de entrar.`)
    setForm({ full_name: '', email: '', password: '', role: 'va', org_id: '' })
    setTimeout(() => setSuccess(''), 5000)
    fetchAll()
  }

  async function updateRole(userId, role) {
    await supabase.from('profiles').update({ role }).eq('id', userId)
    fetchAll()
  }

  async function updateOrg(userId, org_id) {
    await supabase.from('profiles').update({ org_id: org_id || null }).eq('id', userId)
    fetchAll()
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1F3A5F]">Usuarios y VAs</h1>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} usuarios en el sistema</p>
        </div>
        <button onClick={() => { setShowModal(true); setError('') }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium bg-[#2FA4A9] hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> Nuevo usuario
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
          ✅ {success}
        </div>
      )}

      <div className="relative mb-5">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9] bg-white" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserCog className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay usuarios aún.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                {['Usuario', 'Rol', 'Organización asignada', 'Creado'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(u => {
                const roleCfg = roleLabels[u.role] || roleLabels.consumer
                const org = orgs.find(o => o.id === u.org_id)
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1F3A5F] flex items-center justify-center text-white text-sm font-bold">
                          {u.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1F3A5F]">{u.full_name || 'Sin nombre'}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select value={u.role}
                        onChange={e => updateRole(u.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${roleCfg.color}`}>
                        <option value="super_admin">Super Admin</option>
                        <option value="va">Asistente Virtual</option>
                        <option value="repairer">Reparador CRO</option>
                        <option value="consumer">Consumidor</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <select value={u.org_id || ''}
                        onChange={e => updateOrg(u.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2FA4A9] max-w-[180px]">
                        <option value="">Sin organización</option>
                        {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {new Date(u.created_at).toLocaleDateString('es-US')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-display font-semibold text-[#1F3A5F]">Crear nuevo usuario</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Nombre completo *</label>
                <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Maria García"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="maria@email.com"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Contraseña *</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Rol</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]">
                  <option value="va">Asistente Virtual (VA)</option>
                  <option value="repairer">Reparador CRO</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="consumer">Consumidor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Organización</label>
                <select value={form.org_id} onChange={e => setForm({ ...form, org_id: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]">
                  <option value="">Sin organización</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
                <Mail className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">El usuario recibirá un email de verificación. Debe confirmarlo antes de poder entrar al portal.</p>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={handleCreate} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl bg-[#2FA4A9] hover:opacity-90 transition disabled:opacity-60">
                <Save className="w-4 h-4" />
                {saving ? 'Creando...' : 'Crear usuario'}
              </button>
              <button onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
