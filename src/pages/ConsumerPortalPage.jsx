import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FileText, TrendingUp, Clock } from 'lucide-react'

export default function ConsumerPortalPage({ view }) {
  const { user, organization } = useAuth()
  const [consumer, setConsumer] = useState(null)
  const [scores, setScores] = useState([])
  const [timeline, setTimeline] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  const teal = organization?.color_secondary || '#2FA4A9'

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: c } = await supabase
      .from('consumers')
      .select('*')
      .eq('email', user?.email)
      .single()

    if (c) {
      setConsumer(c)
      const [{ data: sc }, { data: tl }, { data: dc }] = await Promise.all([
        supabase.from('credit_scores').select('*').eq('consumer_id', c.id).order('recorded_date'),
        supabase.from('timeline_events').select('*').eq('consumer_id', c.id).eq('visibility', 'public').order('created_at', { ascending: false }),
        supabase.from('documents').select('*').eq('consumer_id', c.id).eq('is_visible_to_consumer', true),
      ])
      setScores(sc?.map(s => ({
        date: new Date(s.recorded_date).toLocaleDateString('es-US', { month: 'short', day: 'numeric' }),
        Experian: s.score_experian,
        Equifax: s.score_equifax,
        TransUnion: s.score_transunion,
      })) || [])
      setTimeline(tl || [])
      setDocuments(dc || [])
    }
    setLoading(false)
  }

  if (loading) return <div className="p-6 text-center text-slate-400 text-sm mt-20">Cargando tu información...</div>

  if (!consumer) return (
    <div className="p-6 max-w-lg mx-auto mt-20 text-center">
      <div className="bg-amber-50 rounded-2xl p-6">
        <p className="text-amber-700 font-medium">Tu perfil aún no está vinculado a un expediente.</p>
        <p className="text-amber-600 text-sm mt-1">Contacta a tu asesor de crédito para que te active el acceso.</p>
      </div>
    </div>
  )

  const latestScore = scores[scores.length - 1]

  if (view === 'score') return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-[#1F3A5F] mb-1">Mi Score de Crédito</h1>
      <p className="text-sm text-slate-500 mb-6">Evolución de tus 3 burós crediticios</p>

      {latestScore && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { bureau: 'Experian', score: latestScore.Experian, color: teal },
            { bureau: 'Equifax', score: latestScore.Equifax, color: '#1F3A5F' },
            { bureau: 'TransUnion', score: latestScore.TransUnion, color: '#6366F1' },
          ].map(({ bureau, score, color }) => (
            <div key={bureau} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
              <p className="text-xs text-slate-400 mb-2">{bureau}</p>
              <p className="font-display text-3xl font-bold" style={{ color }}>{score || '—'}</p>
              <p className="text-xs text-slate-400 mt-1">puntos</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 className="font-display font-semibold text-[#1F3A5F] mb-4">Historial de scores</h2>
        {scores.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Aún no hay historial de scores registrado.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={scores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis domain={[400, 850]} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Line type="monotone" dataKey="Experian" stroke={teal} strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Equifax" stroke="#1F3A5F" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="TransUnion" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )

  if (view === 'avance') return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-[#1F3A5F] mb-1">Mi Avance</h1>
      <p className="text-sm text-slate-500 mb-6">Seguimiento de tu proceso de reparación de crédito</p>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: teal }}>
            {consumer.full_name?.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-[#1F3A5F]">{consumer.full_name}</p>
            <p className="text-sm text-slate-400">Estatus actual: <span className="font-medium text-[#1F3A5F]">{consumer.status}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h2 className="font-display font-semibold text-[#1F3A5F] mb-4">Timeline de avance</h2>
        {timeline.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Aún no hay actualizaciones públicas de tu proceso.</p>
        ) : (
          <div className="space-y-4">
            {timeline.map(e => (
              <div key={e.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100">
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="w-px flex-1 bg-slate-100 mt-2" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-semibold text-[#1F3A5F]">{e.title}</p>
                  {e.description && <p className="text-sm text-slate-500 mt-1">{e.description}</p>}
                  {e.next_action_date && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      📅 Próxima acción: {new Date(e.next_action_date).toLocaleDateString('es-US')}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{new Date(e.created_at).toLocaleDateString('es-US')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (view === 'documentos') return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-[#1F3A5F] mb-1">Mis Documentos</h1>
      <p className="text-sm text-slate-500 mb-6">Cartas y documentos compartidos contigo</p>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Aún no hay documentos disponibles para ti.</p>
          </div>
        ) : (
          <div className="space-y-3">
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
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition flex-shrink-0">
                  Descargar
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return null
}
