import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Heart,
  MessageSquare,
  AlertCircle,
} from 'lucide-react'

export const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage] = useState(location.state?.message || '')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) {
      setError('Please enter your email or username.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password,
      })

      if (authError) throw authError

      // Wait a moment for auth state to propagate smoothly
      await new Promise((resolve) => setTimeout(resolve, 300))
      navigate('/', { replace: true })
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-gradient-to-tr from-sky-50 via-slate-50 to-indigo-50/60">
      {/* Soft pastel ambient gradient orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-rose-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Glass Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 shadow-2xl shadow-indigo-500/5 p-6 sm:p-8">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-blue via-sky-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 mb-3 group hover:scale-105 transition-transform">
              <Sparkles size={26} className="animate-spin-slow" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight mb-1">
              Welcome to <span className="text-primary-blue">CozMeet</span>
            </h1>
            <p className="text-xs sm:text-sm text-secondary-text">
              Connect with friends, share moments, and explore creators
            </p>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex p-1 bg-slate-100/80 rounded-2xl mb-6 border border-slate-200/60">
            <button
              type="button"
              className="flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white text-primary-blue shadow-xs transition-all"
            >
              Sign In
            </button>
            <Link
              to="/register"
              className="flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl text-secondary-text hover:text-dark-text text-center transition-all"
            >
              Create Account
            </Link>
          </div>

          {/* Feedback Messages */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <p className="font-semibold mb-0.5">Could not sign in</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email or Username input */}
            <div>
              <label className="block text-xs font-semibold text-dark-text mb-1.5">
                Email or Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-text group-focus-within:text-primary-blue transition-colors">
                  <Mail size={17} />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    if (error) setError('')
                  }}
                  disabled={loading}
                  placeholder="name@example.com or @username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-border-gray rounded-xl text-sm text-dark-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-dark-text">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-text group-focus-within:text-primary-blue transition-colors">
                  <Lock size={17} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-border-gray rounded-xl text-sm text-dark-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary-text hover:text-dark-text transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-blue via-blue-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-95 active:scale-[0.99] transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-6 text-center text-xs text-secondary-text">
            <span>Don't have an account yet? </span>
            <Link
              to="/register"
              className="font-bold text-primary-blue hover:underline"
            >
              Sign up now
            </Link>
          </div>
        </div>

        {/* Feature Highlights Pills under the card */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-secondary-text">
          <span className="flex items-center gap-1.5">
            <Heart size={13} className="text-pink-500" />
            Share Moments
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="flex items-center gap-1.5">
            <Users size={13} className="text-primary-blue" />
            Follow Creators
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="flex items-center gap-1.5">
            <MessageSquare size={13} className="text-emerald-500" />
            Realtime Chat
          </span>
        </div>
      </div>
    </div>
  )
}
