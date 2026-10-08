import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/common/Avatar'

export const Settings = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
      })
    }
  }, [profile])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setMessage('')

      if (!profile?.id) return

      const cleanUsername = formData.username
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name.trim(),
          username: cleanUsername,
          bio: formData.bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      setMessage('Profile settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="bg-light-gray min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-dark-text mb-8">Settings</h1>

          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-xl text-sm ${
                message.includes('success')
                  ? 'bg-green-100 border border-green-300 text-green-800'
                  : 'bg-red-100 border border-red-300 text-red-800'
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4 pb-6 border-b border-border-gray">
              <Avatar
                src={profile?.avatar_url || undefined}
                size="lg"
                alt={formData.display_name}
              />
              <div>
                <p className="font-semibold text-dark-text text-sm">
                  {formData.display_name || 'Your Profile'}
                </p>
                <p className="text-xs text-secondary-text">
                  @{formData.username || 'username'}
                </p>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm text-dark-text"
                placeholder="Your display name"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text text-sm">
                  @
                </span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2.5 border border-border-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm text-dark-text"
                  placeholder="username"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-border-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none text-sm text-dark-text"
                placeholder="Tell the community about yourself..."
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          {/* Logout Button */}
          <div className="mt-6 pt-6 border-t border-border-gray">
            <button
              onClick={handleLogout}
              className="btn-secondary w-full py-3 rounded-xl text-sm font-semibold hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
