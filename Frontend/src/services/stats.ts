import { supabase } from '@/lib/supabase'

export const calculateProfileStats = async (userId: string) => {
  try {
    // Get posts count
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get followers count
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    // Get following count
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    return {
      posts_count: postsCount || 0,
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
    }
  } catch (err) {
    console.error('Error calculating stats:', err)
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
