import { useEffect, useState } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Comment } from '@/types'
import { Avatar } from '@/components/common/Avatar'
import { formatTime } from '@/utils/format'

interface CommentListProps {
  postId: string
}

export const CommentList = ({ postId }: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await supabase
          .from('comments')
          .select(`
            *,
            user:profiles(*)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true })

        if (data) {
          setComments(data as Comment[])
        }
      } catch (err) {
        console.error('Failed to fetch comments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [postId])

  if (loading) return <div className="text-center text-secondary-text">Loading...</div>

  return (
    <div className="space-y-3">
      {comments.length === 0 ? (
        <p className="text-center text-secondary-text text-sm">No comments yet</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar
              src={comment.user?.avatar_url}
              size="sm"
              alt={comment.user?.display_name}
            />
            <div className="flex-1">
              <div className="bg-light-gray rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-dark-text">
                    {comment.user?.display_name}
                  </p>
                  <p className="text-xs text-secondary-text">
                    {formatTime(comment.created_at)}
                  </p>
                </div>
                <p className="text-sm text-dark-text mt-1">{comment.content}</p>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-secondary-text">
                <button className="flex items-center gap-1 hover:text-red-500">
                  <Heart size={14} /> Like
                </button>
                <button className="hover:text-dark-text">Reply</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
