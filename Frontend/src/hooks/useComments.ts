import { useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Comment } from '@/types'

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setComments(data as Comment[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments')
    } finally {
      setLoading(false)
    }
  }, [postId])

  const addComment = useCallback(async (content: string, userId: string) => {
    try {
      const { data, error: insertError } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: userId,
          content,
        }])
        .select()

      if (insertError) throw insertError

      // Refetch comments to include new comment with user data
      await fetchComments()
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
      throw err
    }
  }, [postId, fetchComments])

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (deleteError) throw deleteError

      setComments(comments.filter(c => c.id !== commentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
      throw err
    }
  }, [comments])

  return { comments, loading, error, fetchComments, addComment, deleteComment }
}
