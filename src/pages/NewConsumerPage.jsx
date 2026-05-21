import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewConsumerPage() {
  const navigate = useNavigate()
  const { profile, organization } = useAuth()
  const teal = organization?.color_secondary || '#2FA4A9'

  const [form, setForm] = useState({
    full_name: '', dob: '', address: '', phone: '', email: '',
    ssn_encrypted: '', monitoring_portal: '', notes: '', status: 'En análisis',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.full_name) { setError('El nombre es obligatorio.'); return }
    setLoading(true)
    setError('')

    const { error } = await supabase.from('consumers').insert({
      ...form,
      org_id: profile.org_id,
      assigned_va_id: profile.role === 'va' ? profile.id : null,
    })

    if (error) { setError('Error al guardar. Intenta de nuevo.'); setLoading(false) }
    else navigate('/consumidores')
  }

  const fields = [
    { name: 'full_name', label: 'Nombre completo *', type: 'text', placeholder: 'Maria García' },
    { name: 'dob', label: 'Fecha de nacimiento', type: 'date', placeholder: '' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'maria@email.com' },
    { name: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+1 (305) 000-0000' },
    { name: 'address', label: 'Dirección', type: 'text', placeholder: '123 Main St, Miami FL 33101' },
    { name: 'ssn_encrypted', label: 'SSN (se guardará encriptado)', type: 'password', placeholder: '***-**-****' },
    { name: 'monitoring_portal', label: 'Portal de monitoreo', type: 'text', placeholder: 'IdentityIQ, SmartCredit...' },
  ]

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-4 transition">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h1 className="font-display text-xl font-bold text-[#1F3A5F] mb-1">Nuevo consumidor</h1>
        <p className="text-sm text-slate-400 mb-6">Completa la información básica del cliente.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(({ name, label, type, placeholder }) => (
              <div key={name} className={name === 'address' || name === 'monitoring_portal' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
                <input
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9] transition"
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Estatus inicial</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]"
              >
                {['En análisis','Disputa Ronda 1','Disputa Ronda 2','Disputa Ronda 3','Completado','Pausado'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Notas adicionales</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Observaciones relevantes sobre el consumidor..."
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-white text-sm font-medium rounded-xl transition hover:opacity-90 disabled:opacity-60"
              style={{ background: teal }}
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar consumidor'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 text-sm font-medium text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
