import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [fadeIn, setFadeIn] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 50)
  }, [])

  useEffect(() => {
    let interval
    if (loading) {
      setProgress(0)
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) return prev
          return prev + Math.random() * 12
        })
      }, 200)
    } else {
      setProgress(0)
    }
    return () => clearInterval(interval)
  }, [loading])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setProgress(100)
      setTimeout(() => {
        setError('Correo o contraseña incorrectos.')
        setLoading(false)
        setProgress(0)
      }, 400)
    } else {
      setProgress(100)
      setTimeout(() => navigate('/dashboard'), 400)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F3A5F] via-[#1a3352] to-[#0f2035] flex items-center justify-center p-4">

      {/* Loading bar top */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50">
        <div
          className="h-full bg-[#2FA4A9] transition-all duration-300 ease-out"
          style={{ width: loading ? `${progress}%` : '0%', opacity: loading ? 1 : 0 }}
        />
      </div>

      <div
        className="w-full max-w-md transition-all duration-700 ease-out"
        style={{ opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(16px)' }}
      >
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center">
            <img
              src="https://raw.githubusercontent.com/Fraagjenifer-Art/proasist-portal/main/logo.png"
              alt="ProAssist Agency"
              className="h-24 w-auto object-contain drop-shadow-lg mb-3"
              onError={e => { e.target.style.display = 'none'; document.getElementById('fallback-logo').style.display = 'flex' }}
            />
            <div id="fallback-logo" className="hidden w-20 h-20 rounded-2xl items-center justify-center bg-[#2FA4A9] mb-3 shadow-lg">
              <span className="text-white font-display font-bold text-2xl">P</span>
            </div>
          </div>
          <p className="text-[#2FA4A9] text-sm font-medium tracking-wide">Agency Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="font-display text-xl font-semibold text-[#1F3A5F] mb-6">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2FA4A9] focus:border-transparent transition disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2FA4A9] focus:border-transparent transition pr-11 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-medium py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-70 mt-2 relative overflow-hidden"
              style={{ background: '#1F3A5F' }}
            >
              <span className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                Entrar al portal
              </span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            ¿Problemas para entrar? Contacta a tu administrador.
          </p>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">© 2025 Proasist Agency · Todos los derechos reservados</p>
      </div>
    </div>
  )
}
