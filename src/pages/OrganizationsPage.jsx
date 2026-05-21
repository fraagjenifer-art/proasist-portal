import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Building2, Search, Edit2, ToggleLeft, ToggleRight, X, Save } from 'lucide-react'

const emptyForm = {
  name: '', slug: '', color_primary: '#1F3A5F',
  color_secondary: '#2FA4A9', color_bg: '#FFFFFF',
}

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchOrgs() }, [])

  async function fetchOrgs() {
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })
    setOrgs(data || [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  function openEdit(org) {
    setEditing(org)
    setForm({
      name: org.name,
      slug: org.slug,
      color_primary: org.color_primary || '#1F3A5F',
      color_secondary: org.color_secondary || '#2FA4A9',
      color_bg: org.color_bg || '#FFFFFF',
    })
    setError('')
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name || !form.slug) { setError('Nombre y slug son obligatorios.'); return }
    setSaving(true)
    setError('')

    if (editing) {
      const { error } = await supabase.from('organizations').update(form).eq('id', editing.id)
      if (error) { setError('Error al guardar.'); setSaving(false); return }
    } else {
      const { error } = await supabase.from('organizations').insert({ ...form, is_active: true })
      if (error) { setError(error.message.includes('slug') ? 'Ese slug ya existe, usa otro.' : 'Error al guardar.'); setSaving(false); return }
    }

    setSaving(false)
    setShowModal(false)
    fetchOrgs()
  }

  async function toggleActive(org) {
    await supabase.from('organizations').update({ is_active: !org.is_active }).eq('id', org.id)
    fetchOrgs()
  }

  const filtered = orgs.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.slug?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1F3A5F]">Organizaciones CRO</h1>
          <p className="text-sm text-slate-500 mt-0.5">{orgs.length} agencias registradas</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium bg-[#2FA4A9] hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> Nueva CRO
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o slug..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9] bg-white" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay organizaciones. Crea la primera.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                {['Organización', 'Slug', 'Colores', 'Estatus', 'Creada', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(org => (
                <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: org.color_primary || '#1F3A5F' }}>
                        {org.name?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-[#1F3A5F]">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{org.slug}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      <div className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: org.color_primary }} title="Primario" />
                      <div className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: org.color_secondary }} title="Acento" />
                      <div className="w-5 h-5 rounded-full border border-slate-200 shadow-sm" style={{ background: org.color_bg }} title="Fondo" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${org.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {org.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400">
                    {new Date(org.created_at).toLocaleDateString('es-US')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(org)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleActive(org)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
                        {org.is_active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-display font-semibold text-[#1F3A5F]">
                {editing ? 'Editar CRO' : 'Nueva organización CRO'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Nombre de la empresa *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="CreditXcel Agency"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Slug (URL única) *</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                  placeholder="creditxcel-agency"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9] font-mono" />
                <p className="text-xs text-slate-400 mt-1">Solo letras, números y guiones. Sin espacios.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'color_primary', label: 'Color primario' },
                  { key: 'color_secondary', label: 'Color acento' },
                  { key: 'color_bg', label: 'Fondo' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
                    <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-xl">
                      <input type="color" value={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
                      <span className="text-xs font-mono text-slate-500">{form[key]}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live preview */}
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <div className="p-3 flex items-center gap-2" style={{ background: form.color_primary }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: form.color_secondary }}>
                    {form.name?.charAt(0) || 'C'}
                  </div>
                  <span className="text-white text-xs font-medium">{form.name || 'Tu CRO'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl bg-[#2FA4A9] hover:opacity-90 transition disabled:opacity-60">
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar'}
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
