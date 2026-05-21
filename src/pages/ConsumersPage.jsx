import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/ui/StatusBadge'
import { Search, Plus, Users } from 'lucide-react'

export default function ConsumersPage() {
  const navigate = useNavigate()
  const { organization } = useAuth()
  const [consumers, setConsumers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [loading, setLoading] = useState(true)

  const teal = organization?.color_secondary || '#2FA4A9'
  const statuses = ['Todos', 'En análisis', 'Disputa Ronda 1', 'Disputa Ronda 2', 'Disputa Ronda 3', 'Completado', 'Pausado']

  useEffect(() => {
    supabase.from('consumers').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setConsumers(data || []); setLoading(false) })
  }, [])

  const filtered = consumers.filter(c => {
    const matchSearch = c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Todos' || c.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1F3A5F]">Consumidores</h1>
          <p className="text-sm text-slate-500 mt-0.5">{consumers.length} consumidores en total</p>
        </div>
        <button
          onClick={() => navigate('/consumidores/nuevo')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90"
          style={{ background: teal }}
        >
          <Plus className="w-4 h-4" /> Nuevo consumidor
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={filter === s ? { background: teal, color: 'white' } : { background: '#F1F5F9', color: '#64748B' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No se encontraron consumidores.</p>
            <button onClick={() => navigate('/consumidores/nuevo')} className="text-sm font-medium mt-2" style={{ color: teal }}>
              Agregar el primero →
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                {['Nombre', 'Email', 'Teléfono', 'Estatus', 'Creado', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/consumidores/${c.id}`)}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: teal }}>
                        {c.full_name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-medium text-[#1F3A5F]">{c.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{c.email || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{c.phone || '—'}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">{new Date(c.created_at).toLocaleDateString('es-US')}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-xs font-medium" style={{ color: teal }}>Ver →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
