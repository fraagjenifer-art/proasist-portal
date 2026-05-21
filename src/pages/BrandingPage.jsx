import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Save, Upload, Palette } from 'lucide-react'

export default function BrandingPage() {
  const { profile, organization } = useAuth()
  const [form, setForm] = useState({
    name: '',
    color_primary: '#1F3A5F',
    color_secondary: '#2FA4A9',
    color_bg: '#FFFFFF',
    logo_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (organization) {
      setForm({
        name: organization.name || '',
        color_primary: organization.color_primary || '#1F3A5F',
        color_secondary: organization.color_secondary || '#2FA4A9',
        color_bg: organization.color_bg || '#FFFFFF',
        logo_url: organization.logo_url || '',
      })
    }
  }, [organization])

  async function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const path = `logos/${profile.org_id}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('branding').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('branding').getPublicUrl(path)
      setForm(prev => ({ ...prev, logo_url: publicUrl }))
    }
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    await supabase.from('organizations').update({
      name: form.name,
      color_primary: form.color_primary,
      color_secondary: form.color_secondary,
      color_bg: form.color_bg,
      logo_url: form.logo_url,
    }).eq('id', profile.org_id)

    // Apply live
    document.documentElement.style.setProperty('--brand-primary', form.color_primary)
    document.documentElement.style.setProperty('--brand-teal', form.color_secondary)
    document.documentElement.style.setProperty('--brand-bg', form.color_bg)

    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const colorFields = [
    { key: 'color_primary', label: 'Color primario', hint: 'Fondo del sidebar y encabezados' },
    { key: 'color_secondary', label: 'Color de acento', hint: 'Botones, badges y enlaces activos' },
    { key: 'color_bg', label: 'Color de fondo', hint: 'Fondo general de la aplicación' },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1F3A5F]">Kit de Marca</h1>
        <p className="text-sm text-slate-500 mt-1">Personaliza cómo se ve tu portal para tus clientes y equipo.</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
          ✅ Branding guardado y aplicado correctamente.
        </div>
      )}

      <div className="grid gap-5">
        {/* Logo */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-display font-semibold text-[#1F3A5F] mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4" /> Logo de tu empresa
          </h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
              {form.logo_url
                ? <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                : <span className="text-xs text-slate-400 text-center px-2">Sin logo</span>
              }
            </div>
            <div>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium cursor-pointer transition hover:opacity-90 bg-[#1F3A5F]">
                <Upload className="w-4 h-4" />
                {uploading ? 'Subiendo...' : 'Subir logo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
              </label>
              <p className="text-xs text-slate-400 mt-2">PNG o SVG recomendado · Máximo 2MB</p>
            </div>
          </div>
        </div>

        {/* Nombre */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-display font-semibold text-[#1F3A5F] mb-4">Nombre de tu empresa</h2>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Mi Credit Repair Agency"
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]"
          />
        </div>

        {/* Colors */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-display font-semibold text-[#1F3A5F] mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4" /> Colores corporativos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {colorFields.map(({ key, label, hint }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl">
                  <input
                    type="color"
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <div>
                    <p className="text-sm font-mono font-medium text-[#1F3A5F]">{form[key]}</p>
                    <p className="text-xs text-slate-400">{hint}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-display font-semibold text-[#1F3A5F] mb-4">Vista previa del sidebar</h2>
          <div className="rounded-xl overflow-hidden border border-slate-200 w-48">
            <div className="p-3" style={{ background: form.color_primary }}>
              <div className="flex items-center gap-2 mb-4">
                {form.logo_url
                  ? <img src={form.logo_url} alt="" className="w-7 h-7 rounded-lg object-contain bg-white" />
                  : <div className="w-7 h-7 rounded-lg" style={{ background: form.color_secondary }} />
                }
                <span className="text-white text-xs font-semibold truncate">{form.name || 'Tu empresa'}</span>
              </div>
              {['Dashboard', 'Consumidores', 'Documentos'].map((item, i) => (
                <div key={item}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1 text-xs"
                  style={i === 0
                    ? { background: form.color_secondary, color: 'white' }
                    : { color: 'rgba(255,255,255,0.6)' }
                  }
                >
                  <div className="w-2.5 h-2.5 rounded-sm bg-current opacity-60" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 text-white font-medium rounded-xl transition hover:opacity-90 disabled:opacity-60 w-fit"
          style={{ background: form.color_secondary }}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar y aplicar branding'}
        </button>
      </div>
    </div>
  )
}
