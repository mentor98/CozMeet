import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/common/Avatar'
import { uploadAvatarImage } from '@/services/storage'
import { Camera, Loader } from 'lucide-react'

export const Settings = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: '',
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
      })
      setAvatarUrl(profile.avatar_url || null)
    }
  }, [profile])

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file.')
      return
    }

    try {
      setAvatarUploading(true)
      setMessage('')
      const newAvatarUrl = await uploadAvatarImage(file, profile.id)
      setAvatarUrl(newAvatarUrl)

      // Automatically update profile row with new avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (updateError) throw updateError
      setMessage('Avatar photo updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      console.error('Avatar upload error:', err)
      setMessage(err?.message || 'Failed to upload avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

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
    <div className="bg-light-gray min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
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
            {/* Avatar Preview & Upload */}
            <div className="flex items-center gap-4 pb-6 border-b border-border-gray">
              <div className="relative group">
                <Avatar
                  src={avatarUrl || profile?.avatar_url || undefined}
                  size="lg"
                  alt={formData.display_name}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Change avatar"
                >
                  {avatarUploading ? (
                    <Loader size={20} className="animate-spin" />
                  ) : (
                    <Camera size={20} />
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  disabled={avatarUploading}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark-text text-sm">
                  {formData.display_name || 'Your Profile'}
                </p>
                <p className="text-xs text-secondary-text mb-2">
                  @{formData.username || 'username'}
                </p>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="text-xs font-semibold text-primary-blue hover:underline flex items-center gap-1.5"
                >
                  <Camera size={13} />
                  <span>{avatarUploading ? 'Uploading...' : 'Change avatar photo'}</span>
                </button>
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
