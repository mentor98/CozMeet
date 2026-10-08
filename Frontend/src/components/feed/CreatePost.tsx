import { useState, useRef } from 'react'
import { Image, Smile, ChevronDown, Loader, X, FileText } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { Profile } from '@/types'
import { supabase } from '@/lib/supabase'
import { uploadPostImage } from '@/services/storage'
import { combinePostContent } from '@/utils/format'

interface CreatePostProps {
  currentUser?: Profile
  onPostCreated?: () => void
}

export const CreatePost = ({ currentUser, onPostCreated }: CreatePostProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [visibility, setVisibility] = useState('public')
  const [isLoading, setIsLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file (JPEG, PNG, WEBP, GIF)')
        return
      }
      setSelectedImage(file)
      setErrorMessage(null)
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
      if (!isOpen) {
        setIsOpen(true)
      }
    }
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
    setPreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePost = async () => {
    setErrorMessage(null)
    const cleanTitle = title.trim()
    const cleanContent = content.trim()

    if (!cleanTitle && !cleanContent && !selectedImage) {
      setErrorMessage('Please enter a title or write a blog post before publishing.')
      return
    }
    if (!currentUser?.id) {
      setErrorMessage('Please sign in to publish a post.')
      return
    }

    setIsLoading(true)
    try {
      // 1. Verify or create user profile record if needed
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser.id)
        .limit(1)

      if (!existingProfile || existingProfile.length === 0) {
        setStatusText('Verifying profile...')
        await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            username: currentUser.username,
            display_name: currentUser.display_name,
            posts_count: 0,
            followers_count: 0,
            following_count: 0,
          })
      }

      let imageUrl: string | null = null

      // 2. Upload image to post-images storage bucket if attached
      if (selectedImage) {
        setStatusText('Uploading attached image...')
        imageUrl = await uploadPostImage(selectedImage, currentUser.id)
      }

      // 3. Format caption with title + blog content
      const combinedCaption = combinePostContent(cleanTitle, cleanContent)

      // 4. Create post with caption and optional image_url
      setStatusText('Publishing post...')
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: currentUser.id,
          caption: combinedCaption || null,
          image_url: imageUrl,
          visibility: visibility || 'public',
        })

      if (postError) {
        throw new Error(postError.message || 'Failed to insert post')
      }

      // Reset form
      setTitle('')
      setContent('')
      removeSelectedImage()
      setIsOpen(false)
      setStatusText('')

      // Notify parent to refresh feed
      onPostCreated?.()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error creating post:', errorMsg)
      setErrorMessage(`Failed to create post: ${errorMsg}`)
    } finally {
      setIsLoading(false)
      setStatusText('')
    }
  }

  return (
    <div className="card p-4">
      <div className="flex gap-3">
        <Avatar src={currentUser?.avatar_url || undefined} size="md" />
        <div className="flex-1">
          {!isOpen ? (
            <div className="flex items-center gap-2">
              <div
                onClick={() => setIsOpen(true)}
                className="flex-1 bg-light-gray rounded-full px-4 py-3 cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <p className="text-secondary-text text-sm">Write a blog post or share something...</p>
              </div>
              <label className="cursor-pointer p-2.5 hover:bg-light-gray rounded-full transition-colors text-primary-blue flex items-center gap-1.5 text-xs font-semibold">
                <Image size={18} />
                <span className="hidden sm:inline">Photo</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-border-gray/50">
                <div className="flex items-center gap-1.5 text-primary-blue font-bold text-xs uppercase tracking-wider">
                  <FileText size={15} />
                  <span>Create Blog Post</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setTitle('')
                    setContent('')
                    removeSelectedImage()
                  }}
                  className="text-secondary-text hover:text-dark-text p-1 rounded-md"
                >
                  <X size={16} />
                </button>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
                  {errorMessage}
                </div>
              )}

              {/* Title of the Post */}
              <div>
                <label className="block text-xs font-bold text-dark-text mb-1">
                  Title of the post
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your post title (e.g. Navigating Key Tech Trends)..."
                  className="w-full px-3.5 py-2.5 border border-border-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm font-semibold text-dark-text placeholder:text-secondary-text placeholder:font-normal bg-white"
                  disabled={isLoading}
                />
              </div>

              {/* Blog Post Content */}
              <div>
                <label className="block text-xs font-bold text-dark-text mb-1">
                  Blog post content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog post, story, thoughts, or insights..."
                  className="w-full px-3.5 py-3 border border-border-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none text-sm text-dark-text placeholder:text-secondary-text bg-white leading-relaxed"
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              {/* Attached Image Preview */}
              {preview && (
                <div className="relative rounded-xl overflow-hidden border border-border-gray bg-black/5">
                  <img
                    src={preview}
                    alt="Selected attachment preview"
                    className="max-h-80 w-full object-contain mx-auto"
                  />
                  <button
                    type="button"
                    onClick={removeSelectedImage}
                    disabled={isLoading}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-colors shadow-md"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-md">
                    Image attached
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer p-2 hover:bg-light-gray rounded-lg transition-colors text-primary-blue flex items-center gap-1.5 text-xs font-semibold border border-transparent hover:border-border-gray">
                    <Image size={18} />
                    <span>{selectedImage ? 'Change Image' : 'Attach Image (optional)'}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={isLoading}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    className="p-2 hover:bg-light-gray rounded-lg transition-colors text-secondary-text"
                    title="Emoji"
                  >
                    <Smile size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      disabled={isLoading}
                      className="appearance-none px-3 py-2 border border-border-gray rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue text-xs pr-7 text-dark-text"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="friends">Friends</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-text"
                    />
                  </div>

                  <button
                    onClick={handlePost}
                    disabled={(!title.trim() && !content.trim() && !selectedImage) || isLoading}
                    className="btn-primary text-xs py-2 px-5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold"
                  >
                    {isLoading && <Loader size={14} className="animate-spin" />}
                    <span>{isLoading ? statusText || 'Publishing...' : 'Publish Post'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
