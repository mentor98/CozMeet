import { useState, useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  Mail,
  Lock,
  User,
  AtSign,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Check,
  AlertCircle,
  Heart,
  Users,
  MessageSquare,
} from 'lucide-react'

export const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
    confirmPassword: '',
    displayName: '',
    username: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordStrength = useMemo(() => {
    const p = formData.password
    if (!p) return 0
    let score = 0
    if (p.length >= 6) score += 1
    if (p.length >= 8) score += 1
    if (/[A-Z]/.test(p) || /[0-9]/.test(p)) score += 1
    if (/[^A-Za-z0-9]/.test(p)) score += 1
    return score
  }, [formData.password])

  const strengthLabel = useMemo(() => {
    switch (passwordStrength) {
      case 1:
        return { text: 'Weak', color: 'bg-red-400 text-red-600' }
      case 2:
        return { text: 'Fair', color: 'bg-amber-400 text-amber-600' }
      case 3:
        return { text: 'Good', color: 'bg-blue-400 text-blue-600' }
      case 4:
        return { text: 'Strong', color: 'bg-emerald-500 text-emerald-600' }
      default:
        return { text: '', color: '' }
    }
  }, [passwordStrength])

  const passwordsMatch =
    formData.password && formData.confirmPassword
      ? formData.password === formData.confirmPassword
      : null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanEmail = formData.email.trim().toLowerCase()
    const cleanUsername = formData.username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
    const cleanDisplayName = formData.displayName.trim()

    if (!cleanDisplayName) {
      setError('Please enter your display name.')
      return
    }
    if (!cleanUsername) {
      setError('Please enter a valid username (letters, numbers, underscore).')
      return
    }
    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          data: {
            username: cleanUsername,
            display_name: cleanDisplayName,
          },
        },
      })

      if (authError) throw authError

      // Allow brief moment for auth state to update
      await new Promise((resolve) => setTimeout(resolve, 350))
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-gradient-to-tr from-sky-50 via-slate-50 to-indigo-50/60">
      {/* Soft pastel ambient background orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-rose-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-6">
        {/* Main Glass Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 shadow-2xl shadow-indigo-500/5 p-6 sm:p-8">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-blue via-sky-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 mb-3 group hover:scale-105 transition-transform">
              <Sparkles size={26} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight mb-1">
              Join <span className="text-primary-blue">CozMeet</span>
            </h1>
            <p className="text-xs sm:text-sm text-secondary-text">
              Create an account and connect with our creative community
            </p>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex p-1 bg-slate-100/80 rounded-2xl mb-6 border border-slate-200/60">
            <Link
              to="/login"
              className="flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl text-secondary-text hover:text-dark-text text-center transition-all"
            >
              Sign In
            </Link>
            <button
              type="button"
              className="flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white text-primary-blue shadow-xs transition-all"
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <p className="font-semibold mb-0.5">Registration problem</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-dark-text mb-1">
                Display Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-text group-focus-within:text-primary-blue transition-colors">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-border-gray rounded-xl text-sm text-dark-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-dark-text">
                  Username
                </label>
                {formData.username && (
                  <span className="text-[11px] font-mono text-primary-blue font-semibold">
                    @{formData.username.toLowerCase().replace(/[^a-z0-9_]/g, '')}
                  </span>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-text group-focus-within:text-primary-blue transition-colors">
                  <AtSign size={16} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-border-gray rounded-xl text-sm text-dark-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-dark-text mb-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-text group-focus-within:text-primary-blue transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-border-gray rounded-xl text-sm text-dark-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-dark-text">
                  Password
                </label>
                {strengthLabel.text && (
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${strengthLabel.color.split(' ')[1]}`}
                  >
                    {strengthLabel.text}
                  </span>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-text group-focus-within:text-primary-blue transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-border-gray rounded-xl text-sm text-dark-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary-text hover:text-dark-text transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength meter */}
              {formData.password && (
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength >= step
                          ? strengthLabel.color.split(' ')[0]
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-dark-text">
                  Confirm Password
                </label>
                {passwordsMatch !== null && (
                  <span
                    className={`text-[10px] font-semibold flex items-center gap-1 ${
                      passwordsMatch ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {passwordsMatch ? (
                      <>
                        <Check size={12} /> Passwords match
                      </>
                    ) : (
                      'Passwords do not match'
                    )}
                  </span>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-text group-focus-within:text-primary-blue transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Repeat your password"
                  className={`w-full pl-10 pr-11 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border rounded-xl text-sm text-dark-text placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    passwordsMatch === false
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : 'border-border-gray focus:ring-primary-blue/30 focus:border-primary-blue'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary-text hover:text-dark-text transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-blue via-blue-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-95 active:scale-[0.99] transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating your account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-6 text-center text-xs text-secondary-text">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-bold text-primary-blue hover:underline"
            >
              Sign in
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
