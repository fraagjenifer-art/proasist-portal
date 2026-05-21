import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/ui/StatusBadge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowLeft, Upload, Plus, FileText, Clock, ChevronDown } from 'lucide-react'

const tabs = ['Información', 'Scores', 'Disputas', 'Documentos', 'Timeline']

export default function ConsumerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile, organization } = useAuth()
  const [consumer, setConsumer] = useState(null)
  const [scores, setScores] = useState([])
  const [disputes, setDisputes] = useState([])
  const [documents, setDocuments] = useState([])
  const [timeline, setTimeline] = useState([])
  const [activeTab, setActiveTab] = useState('Información')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', description: '', event_type: 'completado', visibility: 'internal', next_action_date: '' })
  const [showEventForm, setShowEventForm] = useState(false)

  const teal = organization?.color_secondary || '#2FA4A9'
  const navy = organization?.color_primary || '#1F3A5F'

  useEffect(() => { fetchAll() }, [id])

  async function fetchAll() {
    const [{ data: c }, { data: sc }, { data: dp }, { data: dc }, { data: tl }] = await Promise.all([
      supabase.from('consumers').select('*').eq('id', id).single(),
      supabase.from('credit_scores').select('*').eq('consumer_id', id).order('recorded_date'),
      supabase.from('dispute_accounts').select('*').eq('consumer_id', id),
      supabase.from('documents').select('*').eq('consumer_id', id).order('uploaded_at', { ascending: false }),
      supabase.from('timeline_events').select('*, profiles(full_name)').eq('consumer_id', id).order('created_at', { ascending: false }),
    ])
    setConsumer(c)
    setScores(sc?.map(s => ({
      date: new Date(s.recorded_date).toLocaleDateString('es-US', { month: 'short', day: 'numeric' }),
      Experian: s.score_experian,
      Equifax: s.score_equifax,
      TransUnion: s.score_transunion,
    })) || [])
    setDisputes(dp || [])
    setDocuments(dc || [])
    setTimeline(tl || [])
    setLoading(false)
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const path = `${id}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('documents').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)
      await supabase.from('documents').insert({
        consumer_id: id,
        uploaded_by: profile.id,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.name.split('.').pop(),
        round_number: 1,
      })
      fetchAll()
    }
    setUploading(false)
  }

  async function handleAddEvent() {
    if (!newEvent.title) return
    await supabase.from('timeline_events').insert({
      consumer_id: id,
      created_by: profile.id,
      ...newEvent,
    })
    setNewEvent({ title: '', description: '', event_type: 'completado', visibility: 'internal', next_action_date: '' })
    setShowEventForm(false)
    fetchAll()
  }

  async function updateStatus(status) {
    await supabase.from('consumers').update({ status }).eq('id', id)
    setConsumer(prev => ({ ...prev, status }))
  }

  const eventTypeConfig = {
    completado:     { label: '✅ Completado',     color: 'bg-green-100 text-green-700' },
    en_progreso:    { label: '🔄 En progreso',    color: 'bg-blue-100 text-blue-700' },
    siguiente_paso: { label: '📅 Siguiente paso', color: 'bg-amber-100 text-amber-700' },
    nota_interna:   { label: '🔒 Nota interna',   color: 'bg-slate-100 text-slate-600' },
  }

  if (loading) return (
    <div className="p-6 text-center text-slate-400 text-sm mt-20">Cargando expediente...</div>
  )
  if (!consumer) return (
    <div className="p-6 text-center text-slate-400 text-sm mt-20">Consumidor no encontrado.</div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back + header */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-4 transition">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5 flex flex-wrap items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white" style={{ background: teal }}>
          {consumer.full_name?.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-[#1F3A5F]">{consumer.full_name}</h1>
          <p className="text-sm text-slate-400">{consumer.email || 'Sin email'} · {consumer.phone || 'Sin teléfono'}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={consumer.status} />
          <select
            value={consumer.status}
            onChange={e => updateStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]"
          >
            {['En análisis','Disputa Ronda 1','Disputa Ronda 2','Disputa Ronda 3','Completado','Pausado'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-100 mb-5 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
            style={activeTab === t ? { background: navy, color: 'white' } : { color: '#64748B' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Información */}
      {activeTab === 'Información' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-display font-semibold text-[#1F3A5F] mb-4">Información general</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Nombre completo', value: consumer.full_name },
              { label: 'Fecha de nacimiento', value: consumer.dob ? new Date(consumer.dob).toLocaleDateString('es-US') : '—' },
              { label: 'Dirección', value: consumer.address || '—' },
              { label: 'Teléfono', value: consumer.phone || '—' },
              { label: 'Email', value: consumer.email || '—' },
              { label: 'Portal de monitoreo', value: consumer.monitoring_portal || '—' },
              { label: 'SSN', value: consumer.ssn_encrypted ? '***-**-****  (encriptado)' : '—' },
              { label: 'Notas', value: consumer.notes || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-medium text-[#1F3A5F]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Scores */}
      {activeTab === 'Scores' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-display font-semibold text-[#1F3A5F] mb-4">Historial de scores crediticios</h2>
          {scores.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No hay historial de scores registrado aún.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={scores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis domain={[400, 850]} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="Experian" stroke="#2FA4A9" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Equifax" stroke="#1F3A5F" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="TransUnion" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Tab: Disputas */}
      {activeTab === 'Disputas' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-display font-semibold text-[#1F3A5F]">Auditoría de cuentas en disputa</h2>
          </div>
          {disputes.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No hay cuentas en disputa registradas.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  {['Cuenta', 'Tipo', 'Buró', 'Ronda', 'Estatus'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {disputes.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 text-sm font-medium text-[#1F3A5F]">{d.account_name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{d.account_type}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">{d.bureau}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">Ronda {d.round_number}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Documentos */}
      {activeTab === 'Documentos' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-display font-semibold text-[#1F3A5F]">Cartas de disputa y documentos</h2>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium cursor-pointer transition hover:opacity-90" style={{ background: teal }}>
              <Upload className="w-4 h-4" />
              {uploading ? 'Subiendo...' : 'Subir documento'}
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
          {documents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No hay documentos subidos aún.</p>
          ) : (
            <div className="p-5 grid gap-3">
              {documents.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50">
                    <FileText className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1F3A5F] truncate">{d.file_name}</p>
                    <p className="text-xs text-slate-400">Ronda {d.round_number} · {new Date(d.uploaded_at).toLocaleDateString('es-US')}</p>
                  </div>
                  <a href={d.file_url} target="_blank" rel="noreferrer"
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition">
                    Descargar
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Timeline */}
      {activeTab === 'Timeline' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-display font-semibold text-[#1F3A5F]">Timeline / Bitácora</h2>
            <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition hover:opacity-90"
              style={{ background: teal }}
            >
              <Plus className="w-4 h-4" /> Agregar evento
            </button>
          </div>

          {showEventForm && (
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  placeholder="Título del evento"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]"
                />
                <select
                  value={newEvent.event_type}
                  onChange={e => setNewEvent({ ...newEvent, event_type: e.target.value })}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]"
                >
                  <option value="completado">✅ Completado</option>
                  <option value="en_progreso">🔄 En progreso</option>
                  <option value="siguiente_paso">📅 Siguiente paso</option>
                  <option value="nota_interna">🔒 Nota interna</option>
                </select>
                <textarea
                  placeholder="Descripción (opcional)"
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9] col-span-2 resize-none"
                  rows={2}
                />
                <input
                  type="date"
                  value={newEvent.next_action_date}
                  onChange={e => setNewEvent({ ...newEvent, next_action_date: e.target.value })}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]"
                />
                <select
                  value={newEvent.visibility}
                  onChange={e => setNewEvent({ ...newEvent, visibility: e.target.value })}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]"
                >
                  <option value="internal">🔒 Solo interno</option>
                  <option value="public">👁 Visible al consumidor</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddEvent} className="px-4 py-2 text-sm text-white rounded-xl font-medium" style={{ background: teal }}>Guardar</button>
                <button onClick={() => setShowEventForm(false)} className="px-4 py-2 text-sm text-slate-600 rounded-xl font-medium bg-slate-200">Cancelar</button>
              </div>
            </div>
          )}

          <div className="p-5 space-y-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No hay eventos en el timeline aún.</p>
            ) : timeline.map(e => (
              <div key={e.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100">
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="w-px flex-1 bg-slate-100 mt-2" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-[#1F3A5F]">{e.title}</p>
                      {e.description && <p className="text-sm text-slate-500 mt-1">{e.description}</p>}
                      {e.next_action_date && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                          📅 Próxima acción: {new Date(e.next_action_date).toLocaleDateString('es-US')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${eventTypeConfig[e.event_type]?.color}`}>
                        {eventTypeConfig[e.event_type]?.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(e.created_at).toLocaleDateString('es-US')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
