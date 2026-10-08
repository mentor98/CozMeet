import { useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'

export const useFollow = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleFollow = useCallback(async (followerId: string, followingId: string, isFollowing: boolean) => {
    try {
      setLoading(true)
      setError(null)

      if (isFollowing) {
        // Unfollow
        const { error: unfollowError } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', followerId)
          .eq('following_id', followingId)

        if (unfollowError) throw unfollowError
      } else {
        // Follow
        const { error: followError } = await supabase
          .from('follows')
          .insert([{
            follower_id: followerId,
            following_id: followingId,
          }])

        if (followError) throw followError
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle follow')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { toggleFollow, loading, error }
}
