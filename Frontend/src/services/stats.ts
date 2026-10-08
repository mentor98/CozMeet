import { supabase } from '@/lib/supabase'

// Timeout promise helper
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ])
}

export const calculateProfileStats = async (userId: string) => {
  try {
    // Fetch all stats in parallel with timeout
    const [postsRes, followersRes, followingRes] = await Promise.all([
      withTimeout(
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        2000
      ),
      withTimeout(
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId),
        2000
      ),
      withTimeout(
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId),
        2000
      ),
    ])

    return {
      posts_count: postsRes.count || 0,
      followers_count: followersRes.count || 0,
      following_count: followingRes.count || 0,
    }
  } catch (err) {
    console.error('Error calculating stats:', err)
    // Return default stats on timeout/error
    return {
      posts_count: 0,
      followers_count: 0,
      following_count: 0,
    }
  }
}

export const updateProfileStats = async (userId: string) => {
  try {
    const stats = await calculateProfileStats(userId)

    const { error } = await supabase
      .from('profiles')
      .update(stats)
      .eq('id', userId)

    if (error) throw error

    return stats
  } catch (err) {
    console.error('Error updating profile stats:', err)
    return null
  }
}
