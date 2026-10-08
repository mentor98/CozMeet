import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/common/Avatar'

export const Settings = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setMessage('')

      if (!profile?.id) return

      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id)

      if (error) throw error

      setMessage('Settings saved successfully!')
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
              className={`mb-6 px-4 py-3 rounded-lg text-sm ${
                message.includes('success')
                  ? 'bg-green-100 border border-green-300 text-green-800'
                  : 'bg-red-100 border border-red-300 text-red-800'
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-dark-text mb-3">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <Avatar src={profile?.avatar_url || undefined} size="lg" />
                <button type="button" className="btn-secondary">
                  Upload Photo
                </button>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                disabled
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          {/* Logout Button */}
          <div className="mt-8 pt-8 border-t border-border-gray">
            <button
              onClick={handleLogout}
              className="btn-secondary w-full"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
