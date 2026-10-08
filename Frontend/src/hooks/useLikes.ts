import { useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'

export const useLikes = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleLike = useCallback(async (postId: string, userId: string, isLiked: boolean) => {
    try {
      setLoading(true)
      setError(null)

      if (isLiked) {
        // Unlike
        const { error: unlikeError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)

        if (unlikeError) throw unlikeError
      } else {
        // Like
        const { error: likeError } = await supabase
          .from('post_likes')
          .insert([{
            post_id: postId,
            user_id: userId,
          }])

        if (likeError) throw likeError
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle like')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { toggleLike, loading, error }
}
