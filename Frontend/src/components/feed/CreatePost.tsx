import { useState } from 'react'
import { Image, Video, PieChart, Smile, Globe, ChevronDown, Loader } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { Profile } from '@/types'
import { supabase } from '@/lib/supabase'

interface CreatePostProps {
  currentUser?: Profile
  onPostCreated?: () => void
}

export const CreatePost = ({ currentUser, onPostCreated }: CreatePostProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [caption, setCaption] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [visibility, setVisibility] = useState('public')
  const [isLoading, setIsLoading] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePost = async () => {
    if (!caption.trim() && !selectedImage) {
      alert('Please write something or add an image to post!')
      return
    }
    if (!currentUser?.id) {
      alert('Please login to post!')
      return
    }

    setIsLoading(true)
    try {
      console.log('Creating post for user:', currentUser.id)

      // First, ensure profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser.id)
        .limit(1)

      if (!existingProfile || existingProfile.length === 0) {
        console.log('Profile not found, creating...')
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            username: currentUser.username,
            display_name: currentUser.display_name,
            posts_count: 0,
            followers_count: 0,
            following_count: 0,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw new Error(`Profile creation failed: ${profileError.message}`)
        }
      }

      console.log('Profile verified, uploading image if selected...')

      let imageUrl: string | null = null

      // Upload image if selected
      if (selectedImage) {
        try {
          const fileExt = selectedImage.name.split('.').pop()
          const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`
          const filePath = `posts/${fileName}`

          console.log('Uploading image to:', filePath)

          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('post-images')
            .upload(filePath, selectedImage)

          if (uploadError) {
            console.error('Upload error:', uploadError)
            throw new Error(`Image upload failed: ${uploadError.message}`)
          }

          console.log('Image uploaded successfully, getting public URL...')

          const { data: publicUrlData } = supabase.storage
            .from('post-images')
            .getPublicUrl(filePath)

          imageUrl = publicUrlData?.publicUrl || null
          console.log('Image URL:', imageUrl)
        } catch (err) {
          console.error('Image upload failed:', err)
          const errMsg = err instanceof Error ? err.message : String(err)
          alert(`Image upload failed: ${errMsg}\n\nPost will be created without image.`)
          imageUrl = null
        }
      }

      console.log('Creating post with imageUrl:', imageUrl)

      // Create post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: currentUser.id,
          caption: caption.trim() || null,
          image_url: imageUrl,
          visibility: 'public',
        })

      if (postError) {
        console.error('Post insert error:', postError)
        throw new Error(postError.message || 'Failed to insert post')
      }

      console.log('Post created successfully!')

      // Reset form
      setCaption('')
      setSelectedImage(null)
      setPreview('')
      setIsOpen(false)
      
      // Notify parent
      onPostCreated?.()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error creating post:', errorMsg)
      alert(`Failed to create post: ${errorMsg}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-4 mb-4">
      <div className="flex gap-3">
        <Avatar src={currentUser?.avatar_url || undefined} size="md" />
        <div className="flex-1">
          {!isOpen ? (
            <div
              onClick={() => setIsOpen(true)}
              className="bg-light-gray rounded-full px-4 py-3 cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <p className="text-secondary-text">Share something...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Share something..."
                className="w-full px-4 py-3 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none text-sm"
                rows={3}
              />

              {preview && (
                <div className="relative">
                  <img src={preview} alt="Preview" className="max-h-64 rounded-lg w-full object-cover" />
                  <button
                    onClick={() => {
                      setPreview('')
                      setSelectedImage(null)
                    }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <label className="cursor-pointer p-2 hover:bg-light-gray rounded-lg transition-colors">
                    <Image size={20} className="text-secondary-text" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  <button className="p-2 hover:bg-light-gray rounded-lg transition-colors">
                    <Video size={20} className="text-secondary-text" />
                  </button>
                  <button className="p-2 hover:bg-light-gray rounded-lg transition-colors">
                    <PieChart size={20} className="text-secondary-text" />
                  </button>
                  <button className="p-2 hover:bg-light-gray rounded-lg transition-colors">
                    <Smile size={20} className="text-secondary-text" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="appearance-none px-3 py-2 border border-border-gray rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm pr-8"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="friends">Friends</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-text"
                    />
                  </div>
                  <button
                    onClick={handlePost}
                    disabled={(!caption.trim() && !selectedImage) || isLoading}
                    className="btn-primary text-sm py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading && <Loader size={16} className="animate-spin" />}
                    {isLoading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {isOpen && (
          <button
            onClick={() => {
              setIsOpen(false)
              setCaption('')
              setPreview('')
              setSelectedImage(null)
            }}
            className="text-secondary-text hover:text-dark-text"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
