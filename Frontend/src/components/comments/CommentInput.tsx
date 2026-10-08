import { useState } from 'react'
import { Avatar } from '@/components/common/Avatar'
import { Profile } from '@/types'
import { supabase } from '@/lib/supabase'
import { Loader } from 'lucide-react'

interface CommentInputProps {
  postId: string
  currentUser: Profile
  onCommentAdded?: (comment: string) => void
}

export const CommentInput = ({
  postId,
  currentUser,
  onCommentAdded,
}: CommentInputProps) => {
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    setIsLoading(true)
    try {
      await supabase.from('comments').insert([
        {
          post_id: postId,
          user_id: currentUser.id,
          content: comment.trim(),
        },
      ])

      setComment('')
      onCommentAdded?.(comment)
    } catch (err) {
      console.error('Error adding comment:', err)
      alert('Failed to add comment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Avatar src={currentUser.avatar_url || undefined} size="sm" />
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-border-gray rounded-full focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm disabled:opacity-50"
        />
        {comment.trim() && (
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary text-sm py-2 px-4 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader size={16} className="animate-spin" />}
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        )}
      </div>
    </form>
  )
}
