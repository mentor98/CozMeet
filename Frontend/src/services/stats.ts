import { supabase } from '@/lib/supabase'

export const calculateProfileStats = async (userId: string) => {
  if (!userId) {
    return {
      posts_count: 0,
      followers_count: 0,
      following_count: 0,
    }
  }

  try {
    // Fetch live counts in parallel directly from posts and follows tables
    const [postsRes, followersRes, followingRes] = await Promise.all([
      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId),
    ])

    return {
      posts_count: postsRes.count ?? 0,
      followers_count: followersRes.count ?? 0,
      following_count: followingRes.count ?? 0,
    }
  } catch (err) {
    console.error('Error calculating live profile stats:', err)
    return {
      posts_count: 0,
      followers_count: 0,
      following_count: 0,
    }
  }
}

export const updateProfileStats = async (userId: string) => {
  if (!userId) return null

  try {
    const stats = await calculateProfileStats(userId)

    // Sync to profiles table in Supabase
    await supabase
      .from('profiles')
      .update(stats)
      .eq('id', userId)

    return stats
  } catch (err) {
    console.error('Error updating profile stats:', err)
    return null
  }
}

