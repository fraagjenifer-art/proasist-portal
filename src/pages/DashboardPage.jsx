import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/ui/StatusBadge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, Mail, CheckCircle, Search, Plus } from 'lucide-react'

function KPICard({ icon: Icon, label, value, delta, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-display font-bold text-[#1F3A5F]">{value}</p>
      {delta && <p className="text-xs text-emerald-600 mt-1 font-medium">{delta}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { profile, organization } = useAuth()
  const navigate = useNavigate()
  const [consumers, setConsumers] = useState([])
  const [scores, setScores] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [loading, setLoading] = useState(true)

  const teal = organization?.color_secondary || '#2FA4A9'
  const navy = organization?.color_primary || '#1F3A5F'

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: cons } = await supabase
      .from('consumers')
      .select('*')
      .order('created_at', { ascending: false })

    setConsumers(cons || [])

    const { data: sc } = await supabase
      .from('credit_scores')
      .select('*')
      .order('recorded_date', { ascending: true })

    if (sc) buildChartData(sc)
    setLoading(false)
  }

  function buildChartData(sc) {
    const byDate = {}
    sc.forEach(s => {
      const d = s.recorded_date
      if (!byDate[d]) byDate[d] = { date: d, experian: [], equifax: [], transunion: [] }
      if (s.score_experian) byDate[d].experian.push(s.score_experian)
      if (s.score_equifax) byDate[d].equifax.push(s.score_equifax)
      if (s.score_transunion) byDate[d].transunion.push(s.score_transunion)
    })
    const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null
    const chartData = Object.values(byDate).map(d => ({
      date: new Date(d.date).toLocaleDateString('es-US', { month: 'short', day: 'numeric' }),
      Experian: avg(d.experian),
      Equifax: avg(d.equifax),
      TransUnion: avg(d.transunion),
    }))
    setScores(chartData)
  }

  const statuses = ['Todos', 'En análisis', 'Disputa Ronda 1', 'Disputa Ronda 2', 'Completado', 'Pausado']

  const filtered = consumers.filter(c => {
    const matchSearch = c.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Todos' || c.status === filter
    return matchSearch && matchFilter
  })

  const active = consumers.filter(c => c.status !== 'Completado' && c.status !== 'Pausado').length
  const completed = consumers.filter(c => c.status === 'Completado').length
  const avgScore = consumers.length ? Math.round(
    consumers.reduce((acc, c) => acc + (c.avg_score || 620), 0) / consumers.length
  ) : 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1F3A5F]">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {organization?.name || 'Proasist Agency'} · {new Date().toLocaleDateString('es-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        {['super_admin', 'va', 'repairer'].includes(profile?.role) && (
          <button
            onClick={() => navigate('/consumidores/nuevo')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
            style={{ background: teal }}
          >
            <Plus className="w-4 h-4" />
            Nuevo consumidor
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard icon={Users} label="Consumidores activos" value={active} delta="↑ 3 este mes" color={teal} />
        <KPICard icon={TrendingUp} label="Score promedio" value={avgScore || '—'} delta="↑ 22 pts vs mes ant." color="#10B981" />
        <KPICard icon={Mail} label="Cartas enviadas" value={89} delta="Este mes" color="#F59E0B" />
        <KPICard icon={CheckCircle} label="Cuentas eliminadas" value={completed} delta="↑ 8 vs mes ant." color="#6366F1" />
      </div>

      {/* Score chart */}
      {scores.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
          <h2 className="font-display font-semibold text-[#1F3A5F] mb-4">Evolución de scores · Promedio cartera</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={scores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis domain={[500, 800]} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Line type="monotone" dataKey="Experian" stroke="#2FA4A9" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Equifax" stroke="#1F3A5F" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="TransUnion" stroke="#6366F1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Consumers table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <h2 className="font-display font-semibold text-[#1F3A5F] flex-1">Consumidores</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9] w-44"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={filter === s
                  ? { background: teal, color: 'white' }
                  : { background: '#F1F5F9', color: '#64748B' }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando consumidores...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No hay consumidores. <button onClick={() => navigate('/consumidores/nuevo')} className="text-[#2FA4A9] font-medium">Agregar uno →</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Nombre</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Estatus</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Creado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: teal }}>
                        {c.full_name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-medium text-[#1F3A5F]">{c.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">
                    {new Date(c.created_at).toLocaleDateString('es-US')}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => navigate(`/consumidores/${c.id}`)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition"
                      style={{ color: teal }}
                    >
                      Ver expediente →
                    </button>
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
